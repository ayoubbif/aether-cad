import os
from dotenv import load_dotenv

class Config:
  """Application configuration class."""
  def __init__(self):
    load_dotenv()
    self.MAPBOX_ACCESS_TOKEN = self._get_required_env('MAPBOX_ACCESS_TOKEN')
    self.HOST = os.getenv('HOST', '0.0.0.0')
    self.PORT = int(os.getenv('PORT', 5000))
    self.DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    self.ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')

  @staticmethod
  def _get_required_env(key: str) -> str:
    """Get required environment variable or raise error."""
    value = os.getenv(key)
    if not value:
      raise EnvironmentError(f"Missing required environment variable: {key}")
    return value
