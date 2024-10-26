from core.exceptions import ValidationError

class SatelliteImageValidator:
  """Validator for satellite image request parameters."""
  @staticmethod
  def validate_coordinates(latitude: str, longitude: str) -> tuple[float, float]:
    """Validate and convert coordinate parameters."""
    try:
      lat = float(latitude)
      lon = float(longitude)
    except (TypeError, ValueError):
      raise ValidationError("Invalid coordinates format")

    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
      raise ValidationError("Coordinates out of valid range")

    return lat, lon

  @staticmethod
  def validate_image_params(
    zoom: int = 18,
    width: int = 600,
    height: int = 400
  ) -> tuple[int, int, int]:
    """Validate image parameters."""
    if not (0 <= zoom <= 22):
      raise ValidationError("Zoom level must be between 0 and 22")

    if not (1 <= width <= 1280) or not (1 <= height <= 1280):
      raise ValidationError("Image dimensions must be between 1 and 1280 pixels")

    return zoom, width, height
