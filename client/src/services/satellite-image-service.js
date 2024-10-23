export class SatelliteImageService {
  static async fetchImage(latitude, longitude, zoom) {
    const url = `http://localhost:5000/satellite_image?lat=${latitude}&lon=${longitude}&zoom=${zoom}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching satellite image:', error);
      throw error;
    }
  }
}
