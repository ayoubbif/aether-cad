# Aether CAD 🗺️

An interactive Computer-Aided Design (CAD) tool that empowers users to create 3D structures overlaid on map imagery. Built with Three.js for powerful 3D rendering capabilities, integrated with Mapbox Static Images API for high-quality base maps, and powered by a Flask backend.

![Aether CAD Demo](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWs1M2RkYmp6Y2Zsd3N5ejFqOHFlbTVoZ2hlbHNuYXAyM3RnNnhtNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QAgIIVP5CeFSqITjSy/giphy.webp)

## ✨ Features

- **Map Integration**: Seamless loading of high-resolution map imagery from Mapbox Static Images API
- **2D Drawing Tools**: Intuitive interface for creating precise 2D shapes on the map plane
- **3D Modeling**: Easy extrusion of 2D shapes into detailed 3D structures
- **Advanced Controls**:
  - Fine-tune pitch and roof angles of polygons
  - Comprehensive camera controls for optimal viewing
  - Real-time preview of modifications

## 🛠️ Tech Stack

### Frontend

- **Build Tool**: Vite for lightning-fast development
- **Core**: Vanilla JavaScript for optimal performance
- **3D Engine**: Three.js for robust 3D rendering
- **Styling**: Modern CSS for responsive design

### Backend

- **Server**: Flask for lightweight, efficient API handling
- **Runtime**: Python 3.10+
- **Map Services**: Mapbox Static Images API integration

## 📋 Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Mapbox API key ([Get one here](https://www.mapbox.com/))
- For local development:
  - Node.js v18+
  - Python 3.10+

## 🚀 Quick Start with Docker

1. **Clone the repository**

```bash
git clone https://github.com/ayoubbif/aether-cad
cd aether-cad
```

2. **Configure environment**
   Create a `.env` file in the server directory:

```bash
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

3. **Launch the application**

```bash
docker-compose up --build
```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 💻 Local Development Setup

### Frontend Development

```bash
# Navigate to frontend
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Development

```bash
# Navigate to backend
cd server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python3 main.py
```

## 🔌 API Reference

### GET /satellite_image

Retrieves static map imagery from Mapbox API

#### Query Parameters

| Parameter | Type  | Required | Default | Description       |
| --------- | ----- | -------- | ------- | ----------------- |
| lat       | float | Yes      | -       | Latitude          |
| lng       | float | Yes      | -       | Longitude         |
| zoom      | int   | Yes      | -       | Zoom level        |
| width     | int   | No       | 600     | Image width (px)  |
| height    | int   | No       | 400     | Image height (px) |

## 🔑 Environment Variables

| Variable            | Description         | Required |
| ------------------- | ------------------- | -------- |
| MAPBOX_ACCESS_TOKEN | Your Mapbox API key | Yes      |

## 🎯 Future Enhancements

### Version 2.0 Roadmap

#### Enhanced Editing Capabilities

- [ ] Implement Undo/Redo functionality
- [ ] Add command history stack
- [ ] Support for multiple selection and group operations

#### Extended Shape Library

- [ ] Add primitive shapes:
  - [ ] Spheres
  - [ ] Boxes
  - [ ] Cylinders
- [ ] Custom shape creation tools
- [ ] Shape library management

#### Improved UI/UX

- [ ] Modern, responsive interface redesign
- [ ] Customizable workspace layouts
- [ ] Enhanced keyboard shortcuts
- [ ] Context-sensitive help
- [ ] Dark/Light theme support

#### Advanced Object Controls

- [ ] Transform Inspector panel
  - [ ] Precise position control
  - [ ] Rotation on all axes
  - [ ] Uniform/non-uniform scaling
- [ ] Snap-to-grid functionality
- [ ] Object alignment tools
