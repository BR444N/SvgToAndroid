export class ColorUtils {
  private static readonly NAMED_COLORS: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gray: '#808080',
    grey: '#808080',
    lightgray: '#D3D3D3',
    darkgray: '#A9A9A9',
    transparent: '#00000000',
  };

  /**
   * Normaliza cualquier color CSS/SVG a formato hexadecimal Android (#RRGGBB o #AARRGGBB).
   * Retorna null si el color es 'none' o 'transparent' con alfa 0.
   */
  public static normalizeColor(colorStr?: string | null): string | null {
    if (!colorStr) return null;
    const clean = colorStr.trim().toLowerCase();
    if (clean === 'none' || clean === 'transparent') {
      return null;
    }

    if (this.NAMED_COLORS[clean]) {
      return this.NAMED_COLORS[clean];
    }

    // Hex simple: #fff o #ffffff
    if (clean.startsWith('#')) {
      if (clean.length === 4) {
        // #rgb -> #rrggbb
        const r = clean[1];
        const g = clean[2];
        const b = clean[3];
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }
      if (clean.length === 5) {
        // #rgba -> #aarrggbb
        const r = clean[1];
        const g = clean[2];
        const b = clean[3];
        const a = clean[4];
        return `#${a}${a}${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }
      if (clean.length === 7) {
        return clean.toUpperCase();
      }
      if (clean.length === 9) {
        // #rrggbbaa en CSS -> #aarrggbb en Android
        const rr = clean.substring(1, 3);
        const gg = clean.substring(3, 5);
        const bb = clean.substring(5, 7);
        const aa = clean.substring(7, 9);
        return `#${aa}${rr}${gg}${bb}`.toUpperCase();
      }
    }

    // rgb(r, g, b) o rgba(r, g, b, a)
    const rgbaMatch = clean.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
      if (rgbaMatch[4] !== undefined) {
        const a = Math.round(parseFloat(rgbaMatch[4]) * 255).toString(16).padStart(2, '0');
        return `#${a}${r}${g}${b}`.toUpperCase();
      }
      return `#${r}${g}${b}`.toUpperCase();
    }

    // Si es un color desconocido o 'currentColor', usar negro por defecto para Android
    if (clean === 'currentcolor') {
      return '#000000';
    }

    return null;
  }
}
