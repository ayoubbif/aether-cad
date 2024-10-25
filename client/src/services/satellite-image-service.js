export class SatelliteImageService {
  static async fetchImage(latitude, longitude, zoom) {
    const url = `http://68.183.15.72:5000/satellite_image?lat=${latitude}&lon=${longitude}&zoom=${zoom}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
