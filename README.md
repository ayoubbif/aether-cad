# Aether CAD

An interactive CAD tool that allows users to create 3D structures on top of map imagery. Built with Three.js for 3D rendering, utilizing Mapbox Static Images API for the base map, and Flask for backend services.

## Features

- Load map imagery from Mapbox Static Images API
- Draw 2D shapes on the map plane
- Extrude shapes into 3D structures
- Adjust pitch/roof angles of polygons
- Interactive camera controls

## Tech Stack

### Frontend

- Vite
- Vanilla JavaScript
- Three.js for 3D rendering
- CSS for styling

### Backend

- Flask
- Python 3.10+
- Mapbox Static Images API integration

## Prerequisites

- Docker and Docker Compose
- Mapbox API key
- Node.js v18+ (for local development)
- Python 3.10+ (for local development)

## Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/ayoubbif/aether-cad
cd aether-cad
```

2. Create a `.env` file in the root directory:

```
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

3. Build and run the containers:

```bash
docker-compose up --build
```

4. Access the application at `http://localhost:3000:80`

## Local Development Setup

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd server
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the Flask server:

```bash
python3 main.py
```

## API Endpoints

### GET /satellite_image

Fetches a static map image from Mapbox API

- Query Parameters:
  - `lat`: Latitude (required)
  - `lng`: Longitude (required)
  - `zoom`: Zoom level (required)
  - `width`: Image width (optional, default: 600)
  - `height`: Image height (optional, default: 400)

## Environment Variables

- `MAPBOX_ACCESS_TOKEN`: Your Mapbox API key
