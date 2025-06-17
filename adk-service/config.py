"""Configuration module for the SAP Doc scheduling assistant agent."""

import os
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class AgentModel(BaseModel):
    """Agent model settings."""
    
    name: str = Field(default="sap_doc_scheduling_assistant")
    model: str = Field(default="gemini-2.0-flash-001")

class Config(BaseSettings):
    """Configuration settings for the SAP Doc scheduling assistant."""
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(
            os.path.dirname(os.path.abspath(__file__)), ".env"
        ),
        extra='ignore',  # Allow extra fields without validation errors
        case_sensitive=True,
    )
    
    # Agent settings
    agent_settings: AgentModel = Field(default=AgentModel())
    app_name: str = "sap_doc_scheduling_app"
    
    # Google ADK settings - using direct API key, not Vertex AI
    GOOGLE_API_KEY: str = Field(default="")
    GOOGLE_GENAI_USE_VERTEXAI: str = Field(default="0")  # Disable Vertex AI
