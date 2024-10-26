import requests
from core.exceptions import MapboxAPIError

class MapboxService:
  """Service class for Mapbox API interactions."""
  def __init__(self, access_token: str):
    self.access_token = access_token
    self.base_url = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static"

  def generate_url(
    self,
    latitude: float,
    longitude: float,
    zoom: int = 18,
    width: int = 600,
    height: int = 400
  ) -> str:
    """Generate Mapbox API URL for satellite image."""
    return (
      f"{self.base_url}/{longitude},{latitude},"
      f"{zoom}/{width}x{height}@2x"
      f"?access_token={self.access_token}"
    )

  def fetch_satellite_image(
    self,
    latitude: float,
    longitude: float,
    zoom: int = 18,
    width: int = 600,
    height: int = 400
  ) -> bytes:
    """Fetch satellite image from Mapbox API."""
    url = self.generate_url(latitude, longitude, zoom, width, height)

    try:
      response = requests.get(url, timeout=10)
      response.raise_for_status()
      return response.content
    except requests.exceptions.RequestException as e:
      raise MapboxAPIError(f"Failed to fetch image from Mapbox: {str(e)}")
