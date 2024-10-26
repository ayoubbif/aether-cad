import logging
import sys
from logging.handlers import RotatingFileHandler

def setup_logger(name: str) -> logging.Logger:
  """Configure application logger."""
  logger = logging.getLogger(name)
  logger.setLevel(logging.INFO)

  # Console handler
  console_handler = logging.StreamHandler(sys.stdout)
  console_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
  ))
  logger.addHandler(console_handler)

  # File handler
  file_handler = RotatingFileHandler(
    'app.log', maxBytes=1024*1024, backupCount=5
  )
  file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
  ))
  logger.addHandler(file_handler)

  return logger
