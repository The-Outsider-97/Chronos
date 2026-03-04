from src.agents.base_agent import BaseAgent
from logs.logger import get_logger

logger = get_logger("Perception Agent")

class PerceptionAgent(BaseAgent):
    def __init__(self, shared_memory, agent_factory, config=None):
        super().__init__(shared_memory, agent_factory, config)
        logger.info("Perception Agent initialized (Dummy)")

    def execute(self, task_data):
        logger.info(f"Perception Agent executing task: {task_data}")
        return {"status": "success", "data": "dummy_perception_data"}
