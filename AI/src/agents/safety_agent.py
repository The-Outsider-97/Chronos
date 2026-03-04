from src.agents.base_agent import BaseAgent
from logs.logger import get_logger

logger = get_logger("Safety Agent")

class SafetyAgent(BaseAgent):
    def __init__(self, shared_memory, agent_factory, config=None):
        super().__init__(shared_memory, agent_factory, config)
        logger.info("Safety Agent initialized (Dummy)")

    def execute(self, task_data):
        logger.info(f"Safety Agent executing task: {task_data}")
        return {"status": "success", "data": "dummy_safety_data"}
