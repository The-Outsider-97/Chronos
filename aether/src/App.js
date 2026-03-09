import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createInitialState, executeAction } from './utils/gameLogic.js';
import { requestAetherMove } from './service/aetherAiClient.js';
import Board from './components/Board.js';
import ActionDeck from './components/ActionDeck.js';
import PlayerPanel from './components/PlayerPanel.js';
import SideBar from './components/SideBar.js';

const QUICK_GUIDE = [
  'Goal: Connect your edge (Red: Top, Blue: Bottom) to the opposite side OR capture 3 Power Wells.',
  'Turn: Pick 2 actions from the cards below.',
  'Shift: Click edge tiles to slide rows/cols.',
  'Attune: Lock a tile & capture Wells.',
  'Place: a tile.',
  'Rotate: Rotate a tile.',
  'Advance: Move character to the adjacent connected tile.',
];

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialState());
  const [activityLog, setActivityLog] = useState(['System ready.']);

  const postSystemMessage = (message) => {
    if (!message) return;
    setActivityLog((prev) => [message, ...prev].slice(0, 20));
  };

  useEffect(() => {
    if (gameState.mode !== 'PVAI' || gameState.activePlayer !== 2 || gameState.winner) return;

    const timer = setTimeout(async () => {
      const move = await requestAetherMove(gameState);
      if (!move) {
        postSystemMessage('AI skipped turn.');
        setGameState((prev) => ({ ...prev, activePlayer: 1, actionsRemaining: 2 }));
        return;
      }

      setGameState((prev) => ({ ...prev, selectedCardId: move.cardId, selectedActionIndex: move.actionIndex }));
      setTimeout(() => {
        setGameState((prev) => {
          const card = prev.faceUpCards.find((c) => c.id === move.cardId);
          const action = card?.actions?.[move.actionIndex];
          if (!action) {
            postSystemMessage('AI selected an invalid action.');
            return prev;
          }

          const result = executeAction(prev, action, move.target);
          postSystemMessage(result.message || 'AI action resolved.');
          return result.success ? result.newState : prev;
        });
      }, 350);
    }, 800);

    return () => clearTimeout(timer);
  }, [gameState.activePlayer, gameState.actionsRemaining, gameState.mode, gameState.winner]);

  const handleCardSelect = (cardId, actionIndex) => {
    if (gameState.winner || (gameState.mode === 'PVAI' && gameState.activePlayer === 2)) return;
    setGameState((prev) => ({ ...prev, selectedCardId: cardId, selectedActionIndex: actionIndex }));
  };

  const handleTileClick = (row, col) => {
    if (gameState.winner || (gameState.mode === 'PVAI' && gameState.activePlayer === 2)) return;
    if (!gameState.selectedCardId || gameState.selectedActionIndex === null) return;

    const card = gameState.faceUpCards.find((c) => c.id === gameState.selectedCardId);
    const action = card?.actions?.[gameState.selectedActionIndex];
    if (action) {
      const result = executeAction(gameState, action, { row, col });
      if (result.success) setGameState(result.newState);
      postSystemMessage(result.message);
    }
  };

  const handleModeChange = (mode) => {
    const aiStarts = mode === 'PVAI';
    setGameState(createInitialState({ mode, aiStarts }));
    setActivityLog([`Mode switched: ${mode === 'PVAI' ? 'Player v. AI' : 'Player v. Player'}.`]);
  };

  const handleNewGame = () => {
    setGameState(createInitialState({ mode: gameState.mode, aiStarts: gameState.mode === 'PVAI' }));
    setActivityLog(['New game initialized.']);
  };

  const winnerName = gameState.winner ? gameState.players[gameState.winner].name : '';

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans selection:bg-indigo-500/30">
      <div className="mx-auto max-w-[1420px] px-3 py-4 lg:pr-[370px]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start border-b border-white/10 pb-4">
          <section className="relative min-h-[760px]">
            <div className="flex items-center gap-3">
              <h1 className="text-[44px] font-extrabold tracking-[-0.03em] leading-none text-white">
                AETHER <span className="text-red-500">SHIFT</span>
              </h1>
              <button
                type="button"
                onClick={() => setGameState((prev) => ({ ...prev, showGuide: !prev.showGuide }))}
                className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-300 hover:text-white hover:border-indigo-400"
              >
                Quick Guide {gameState.showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
            <p className="mt-2 text-sm tracking-[0.22em] text-neutral-500">TACTICAL SPATIAL WARFARE</p>

            {gameState.showGuide && (
              <div className="absolute top-[76px] left-0 right-0 z-20 rounded-xl border border-indigo-400/40 bg-indigo-950/35 p-4 text-sm">
                <p className="font-semibold text-indigo-100">Quick Guide</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-indigo-100/90">
                  {QUICK_GUIDE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="space-y-4 w-[390px]">
            <div className="text-right pb-2">
              <div className={`text-[38px] font-bold leading-none ${gameState.activePlayer === 1 ? 'text-red-500' : 'text-blue-500'}`}>
                {gameState.players[gameState.activePlayer].name}'s Turn␊
              </div>␊
              <div className="text-xs uppercase tracking-[0.24em] text-neutral-300">Actions: {gameState.actionsRemaining}</div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('PVAI')}
                  className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${
                    gameState.mode === 'PVAI' ? 'border-indigo-400 text-indigo-200' : 'border-white/20 text-neutral-400'
                  }`}
                >
                  Player v. AI
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('PVP')}
                  className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${
                    gameState.mode === 'PVP' ? 'border-indigo-400 text-indigo-200' : 'border-white/20 text-neutral-400'
                  }`}
                >
                  Player v. Player
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PlayerPanel player={gameState.players[1]} isActive={gameState.activePlayer === 1} capturedWells={gameState.capturedWells} />
              <PlayerPanel player={gameState.players[2]} isActive={gameState.activePlayer === 2} capturedWells={gameState.capturedWells} />
            </div>

            <div className="relative flex justify-center">
              <Board gameState={gameState} onTileClick={handleTileClick} />
              {gameState.winner && (
                <div className="absolute inset-5 rounded-2xl border border-white/20 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center p-6">
                  <h2 className="text-4xl font-bold text-white">
                    {gameState.winner === 1 ? 'Victory' : gameState.mode === 'PVAI' ? 'Defeat' : 'Victory'}
                  </h2>
                  <p className="text-sm text-neutral-300">{winnerName} wins — {gameState.winReason}</p>
                  <button
                    type="button"
                    onClick={handleNewGame}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                  >
                    Start New Game
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Action Deck</p>
              <ActionDeck
                cards={gameState.faceUpCards}
                selectedCardId={gameState.selectedCardId}
                selectedActionIndex={gameState.selectedActionIndex}
                onSelect={handleCardSelect}
                disabled={!!gameState.winner || (gameState.mode === 'PVAI' && gameState.activePlayer === 2)}
              />
            </div>
          </section>
        </div>
      </div>

      <SideBar
        className="fixed right-0 top-24 h-[78vh] z-30"
        title="Scoreboard"
        commsTitle="Comms"
        scoreboardContent={(
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs uppercase tracking-widest text-neutral-500">Current Match</div>
              <div className="mt-2 text-neutral-200">Mode: {gameState.mode === 'PVAI' ? 'Player v. AI' : 'Player v. Player'}</div>
              <div className="text-neutral-200">Turn: {gameState.turn}</div>
              <div className="text-neutral-200">Power Wells — Red: {Object.values(gameState.capturedWells).filter((id) => id === 1).length} / Blue: {Object.values(gameState.capturedWells).filter((id) => id === 2).length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-400">
              Winner: {gameState.winner ? winnerName : 'In Progress'}
            </div>
          </div>
        )}
        commsContent={(
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 h-[64vh] overflow-y-auto text-xs font-mono text-neutral-300 space-y-2">
            {activityLog.map((entry, index) => (
              <p key={`${entry}-${index}`} className="border-b border-white/5 pb-2">{entry}</p>
            ))}
          </div>
        )}
      />
    </div>
  );
}
