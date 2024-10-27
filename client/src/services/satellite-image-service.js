export class SatelliteImageService {
  static async fetchImage(latitude, longitude, zoom) {
    const url = `http://localhost:5000/api/v1/satellite-image?lat=${latitude}&lon=${longitude}&zoom=${zoom}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'image/png'
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching satellite image:', error);
      throw error;
    }
  }
}
