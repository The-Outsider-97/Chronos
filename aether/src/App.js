import React, { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import { createInitialState, executeAction } from './utils/gameLogic.js';
import { requestAetherMove } from './service/aetherAiClient.js';
import Board from './components/Board.js';
import ActionDeck from './components/ActionDeck.js';
import PlayerPanel from './components/PlayerPanel.js';

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialState());
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (gameState.mode !== 'PVAI' || gameState.activePlayer !== 2 || gameState.winner) return;

    const timer = setTimeout(async () => {
      const move = await requestAetherMove(gameState);
      if (!move) {
        setNotification('AI skipped turn.');
        setGameState((prev) => ({ ...prev, activePlayer: 1, actionsRemaining: 2 }));
        return;
      }

      setGameState((prev) => ({ ...prev, selectedCardId: move.cardId, selectedActionIndex: move.actionIndex }));
      setTimeout(() => {
        setGameState((prev) => {
          const card = prev.faceUpCards.find((c) => c.id === move.cardId);
          const action = card?.actions?.[move.actionIndex];
          if (!action) {
            setNotification('AI selected an invalid action.');
            return prev;
          }

          const result = executeAction(prev, action, move.target);
          setNotification(result.message || 'AI action resolved.');
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
    if (action) handleActionExecution(action, { row, col });
  };

  const handleActionExecution = (action, target) => {
    const result = executeAction(gameState, action, target);
    if (result.success) {
      setGameState(result.newState);
    }
    setNotification(result.message);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 border-b border-white/10 pb-4 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tighter text-white">AETHER SHIFT</h1>
                <button
                  type="button"
                  onClick={() => setGameState((prev) => ({ ...prev, showGuide: !prev.showGuide }))}
                  className="p-1.5 rounded-full border border-white/20 text-neutral-300 hover:text-white hover:border-indigo-400 transition-colors"
                  aria-label={gameState.showGuide ? 'Hide game guide' : 'Show game guide'}
                  title={gameState.showGuide ? 'Hide game guide' : 'Show game guide'}
                >
                  {gameState.showGuide ? <X size={14} /> : <Info size={14} />}
                </button>
              </div>
              <p className="mt-1 text-xs md:text-sm tracking-[0.28em] text-indigo-300/80">TACTICAL SPATIAL WARFARE</p>
            </div>
            <div className={`text-xl font-bold ${gameState.activePlayer === 1 ? 'text-red-500' : 'text-blue-500'}`}>{gameState.players[gameState.activePlayer].name}'s Turn</div>
          </div>

          {gameState.showGuide && (
            <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-indigo-100/90 leading-relaxed">
              <p><span className="font-semibold text-indigo-200">Guide:</span> Complete a path from your home edge to the enemy edge, or capture 3 power wells.</p>
              <p className="text-indigo-200/85 mt-2">Each turn has 2 actions. Use SHIFT to control lanes, ADVANCE to navigate connected routes, and ATTUNE to lock key power wells.</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-3 space-y-6"><PlayerPanel player={gameState.players[1]} isActive={gameState.activePlayer === 1} capturedWells={gameState.capturedWells} /><div className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">{notification || 'System ready.'}</div></div>
        <div className="lg:col-span-6 flex justify-center items-start relative"><Board gameState={gameState} onTileClick={handleTileClick} /></div>
        <div className="lg:col-span-3 space-y-6"><PlayerPanel player={gameState.players[2]} isActive={gameState.activePlayer === 2} capturedWells={gameState.capturedWells} /><ActionDeck cards={gameState.faceUpCards} selectedCardId={gameState.selectedCardId} selectedActionIndex={gameState.selectedActionIndex} onSelect={handleCardSelect} disabled={!!gameState.winner || (gameState.mode === 'PVAI' && gameState.activePlayer === 2)} /></div>
      </div>
    </div>
  );
}
