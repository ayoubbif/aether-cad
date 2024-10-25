import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from io import BytesIO

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')

# Enable CORS with specific origins
CORS(app, resources={
    r"/satellite_image": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Get the access token from the environment
MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

# Check if the access token is present
if not MAPBOX_ACCESS_TOKEN:
    raise EnvironmentError("No Mapbox access token found in environment.")

def validate_params(*params):
    """Utility function to check if all required parameters are provided."""
    if not all(params):
        return False
    return True

def generate_mapbox_url(lat, lon, zoom=18, width=600, height=400):
    """
    Generates a URL for fetching static satellite images from the Mapbox API.
    """
    base_url = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static"
    center = f"{lon},{lat}"
    size = f"{width}x{height}"
    return f"{base_url}/{center},{zoom}/{size}@2x?access_token={MAPBOX_ACCESS_TOKEN}"

@app.route('/satellite_image', methods=['GET'])
def get_satellite_image():
    """API endpoint to retrieve a satellite image based on coordinates."""
    latitude = request.args.get('lat')
    longitude = request.args.get('lon')
    zoom = request.args.get('zoom', default=18, type=int)
    width = request.args.get('width', default=600, type=int)
    height = request.args.get('height', default=400, type=int)

    if not validate_params(latitude, longitude):
        return jsonify({"error": "Missing required parameters: 'lat' and 'lon'"}), 400

    mapbox_url = generate_mapbox_url(latitude, longitude, zoom, width, height)

    try:
        response = requests.get(mapbox_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from Mapbox: {str(e)}")
        return jsonify({"error": f"Error fetching image: {str(e)}"}), 500

    image_response = send_file(BytesIO(response.content), mimetype='image/png')
    return image_response

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    # In production, don't run in debug mode
    app.run(host='0.0.0.0', port=port)
