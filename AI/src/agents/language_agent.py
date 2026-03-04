from src.agents.base_agent import BaseAgent
from logs.logger import get_logger

logger = get_logger("Language Agent")

class LanguageAgent(BaseAgent):
    def __init__(self, shared_memory, agent_factory, config=None):
        super().__init__(shared_memory, agent_factory, config)
        logger.info("Language Agent initialized (Dummy)")

    def execute(self, task_data):
        logger.info(f"Language Agent executing task: {task_data}")
        return {"status": "success", "data": "dummy_language_data"}
