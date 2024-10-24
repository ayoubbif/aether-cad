import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from io import BytesIO

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

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

    :param lat: Latitude of the location
    :param lon: Longitude of the location
    :param zoom: Zoom level for the image (default 18)
    :param width: Image width (default 600)
    :param height: Image height (default 400)
    :return: Formatted URL with access token
    """
    base_url = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static"
    center = f"{lon},{lat}"
    size = f"{width}x{height}"

    # Construct the final URL with access token
    return f"{base_url}/{center},{zoom}/{size}@2x?access_token={MAPBOX_ACCESS_TOKEN}"

@app.route('/satellite_image', methods=['GET'])
def get_satellite_image():
    """API endpoint to retrieve a satellite image based on coordinates."""
    latitude = request.args.get('lat')
    longitude = request.args.get('lon')
    zoom = request.args.get('zoom', default=18, type=int)
    width = request.args.get('width', default=600, type=int)
    height = request.args.get('height', default=400, type=int)

    # Validate that latitude and longitude are provided
    if not validate_params(latitude, longitude):
        return jsonify({"error": "Missing required parameters: 'lat' and 'lon'"}), 400

    # Generate the Mapbox URL
    mapbox_url = generate_mapbox_url(latitude, longitude, zoom, width, height)

    try:
        # Make a GET request to Mapbox API
        response = requests.get(mapbox_url)
        response.raise_for_status()  # Raise an exception for 4XX/5XX errors
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from Mapbox: {str(e)}")
        return jsonify({"error": f"Error fetching image: {str(e)}"}), 500

    # Return the image as a PNG file
    return send_file(BytesIO(response.content), mimetype='image/png')

if __name__ == '__main__':
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000)
