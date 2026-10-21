/**
 * Utilitaires géographiques et calcul de proximité WGS84
 */
export class GeoUtils {
  // Limites géographiques du Cameroun (WGS84 avec marge de sécurité frontière)
  private static readonly CAMEROON_BOUNDS = {
    minLat: 1.5,
    maxLat: 13.5,
    minLon: 8.0,
    maxLon: 16.5,
  };

  /**
   * Vérifie si des coordonnées WGS84 sont situées dans le territoire camerounais
   */
  static isWithinCameroon(latitude: number, longitude: number): boolean {
    if (isNaN(latitude) || isNaN(longitude)) return false;
    return (
      latitude >= this.CAMEROON_BOUNDS.minLat &&
      latitude <= this.CAMEROON_BOUNDS.maxLat &&
      longitude >= this.CAMEROON_BOUNDS.minLon &&
      longitude <= this.CAMEROON_BOUNDS.maxLon
    );
  }

  /**
   * Calcule la distance géodésique en mètres entre deux points (Formule Haversine)
   */
  static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
