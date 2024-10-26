# app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from io import BytesIO
from core.config import Config
from core.logger import setup_logger
from core.exceptions import ValidationError, MapboxAPIError
from services.mapbox_service import MapboxService
from api.validators import SatelliteImageValidator

# Initialize configuration
config = Config()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/v1/*": {
        "origins": config.ALLOWED_ORIGINS,
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize services and logger
logger = setup_logger(__name__)
mapbox_service = MapboxService(config.MAPBOX_ACCESS_TOKEN)
validator = SatelliteImageValidator()

@app.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors."""
    return jsonify({"error": str(error)}), 400

@app.errorhandler(MapboxAPIError)
def handle_mapbox_error(error):
    """Handle Mapbox API errors."""
    return jsonify({"error": str(error)}), 502

@app.route('/api/v1/satellite-image', methods=['GET', 'OPTIONS'])
def get_satellite_image():
    """Endpoint to retrieve satellite images."""
    # Handle OPTIONS request explicitly
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # Extract and validate coordinates
        lat, lon = validator.validate_coordinates(
            request.args.get('lat'),
            request.args.get('lon')
        )

        # Extract and validate image parameters
        zoom, width, height = validator.validate_image_params(
            zoom=request.args.get('zoom', type=int, default=18),
            width=request.args.get('width', type=int, default=600),
            height=request.args.get('height', type=int, default=400)
        )

        # Fetch image from Mapbox
        image_data = mapbox_service.fetch_satellite_image(
            latitude=lat,
            longitude=lon,
            zoom=zoom,
            width=width,
            height=height
        )

        response = send_file(
            BytesIO(image_data),
            mimetype='image/png',
            as_attachment=False
        )

        # Add CORS headers to the response
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
