export class SvgSanitizer {
  private static readonly FORBIDDEN_TAGS = new Set([
    'script',
    'iframe',
    'object',
    'embed',
    'foreignobject',
    'applet',
    'meta',
    'link',
    'style', // Previene inyecciones CSS complejas que ejecuten URLs o comportamientos inesperados
  ]);

  private static readonly DANGEROUS_PROTOCOLS = [
    'javascript:',
    'data:text/html',
    'vbscript:',
  ];

  /**
   * Sanitiza un documento SVG eliminando nodos ejecutables, eventos y protocolos maliciosos.
   * @param svgDocument Documento XML parsed.
   * @returns true si se sanitizó correctamente, false si se detectó contenido malicioso crítico.
   */
  public static sanitize(svgDocument: Document): { isClean: boolean; reason?: string } {
    const root = svgDocument.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') {
      return { isClean: false, reason: 'El elemento raíz no es un elemento SVG válido.' };
    }

    // 1. Eliminar etiquetas prohibidas
    const allElements = Array.from(root.querySelectorAll('*'));
    for (const el of allElements) {
      const tagName = el.tagName.toLowerCase();
      if (this.FORBIDDEN_TAGS.has(tagName)) {
        el.remove();
      }
    }

    // 2. Limpiar atributos de todos los elementos restantes
    const remainingElements = [root, ...Array.from(root.querySelectorAll('*'))];
    for (const el of remainingElements) {
      const attributes = Array.from(el.attributes);
      for (const attr of attributes) {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.toLowerCase().trim();

        // Eliminar controladores de eventos (onload, onclick, onerror, etc.)
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Eliminar URLs con protocolos peligrosos (javascript:, etc.)
        for (const protocol of this.DANGEROUS_PROTOCOLS) {
          if (attrValue.startsWith(protocol)) {
            el.removeAttribute(attr.name);
            break;
          }
        }
      }
    }

    return { isClean: true };
  }

  /**
   * Serializa el documento XML ya sanitizado de vuelta a string.
   */
  public static serialize(svgDocument: Document): string {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDocument);
  }
}
