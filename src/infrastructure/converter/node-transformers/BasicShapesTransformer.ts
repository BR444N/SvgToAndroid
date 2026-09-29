import type { INodeTransformer, TransformContext } from './INodeTransformer';
import { PathTransformer } from './PathTransformer';

export class BasicShapesTransformer implements INodeTransformer {
  private pathTransformer = new PathTransformer();

  public canTransform(node: Element): boolean {
    const tag = node.tagName.toLowerCase();
    return ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'].includes(tag);
  }

  public transform(node: Element, context: TransformContext): string[] {
    const tag = node.tagName.toLowerCase();
    const pathD = this.convertToPathData(tag, node);
    if (!pathD) return [];

    // Creamos un nodo virtual tipo 'path' copiando los atributos para reutilizar la lógica de PathTransformer
    const virtualPath = node.ownerDocument.createElement('path');
    for (const attr of Array.from(node.attributes)) {
      virtualPath.setAttribute(attr.name, attr.value);
    }
    virtualPath.setAttribute('d', pathD);

    return this.pathTransformer.transform(virtualPath, context);
  }

  private convertToPathData(tag: string, el: Element): string | null {
    switch (tag) {
      case 'rect': {
        const x = parseFloat(el.getAttribute('x') || '0');
        const y = parseFloat(el.getAttribute('y') || '0');
        const w = parseFloat(el.getAttribute('width') || '0');
        const h = parseFloat(el.getAttribute('height') || '0');
        const rx = parseFloat(el.getAttribute('rx') || '0');
        const ry = parseFloat(el.getAttribute('ry') || el.getAttribute('rx') || '0');

        if (w <= 0 || h <= 0) return null;

        if (rx > 0 || ry > 0) {
          const effectiveRx = Math.min(rx, w / 2);
          const effectiveRy = Math.min(ry, h / 2);
          return (
            `M ${x + effectiveRx} ${y} ` +
            `H ${x + w - effectiveRx} ` +
            `A ${effectiveRx} ${effectiveRy} 0 0 1 ${x + w} ${y + effectiveRy} ` +
            `V ${y + h - effectiveRy} ` +
            `A ${effectiveRx} ${effectiveRy} 0 0 1 ${x + w - effectiveRx} ${y + h} ` +
            `H ${x + effectiveRx} ` +
            `A ${effectiveRx} ${effectiveRy} 0 0 1 ${x} ${y + h - effectiveRy} ` +
            `V ${y + effectiveRy} ` +
            `A ${effectiveRx} ${effectiveRy} 0 0 1 ${x + effectiveRx} ${y} Z`
          );
        }

        return `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
      }

      case 'circle': {
        const cx = parseFloat(el.getAttribute('cx') || '0');
        const cy = parseFloat(el.getAttribute('cy') || '0');
        const r = parseFloat(el.getAttribute('r') || '0');
        if (r <= 0) return null;
        return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
      }

      case 'ellipse': {
        const cx = parseFloat(el.getAttribute('cx') || '0');
        const cy = parseFloat(el.getAttribute('cy') || '0');
        const rx = parseFloat(el.getAttribute('rx') || '0');
        const ry = parseFloat(el.getAttribute('ry') || '0');
        if (rx <= 0 || ry <= 0) return null;
        return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
      }

      case 'line': {
        const x1 = parseFloat(el.getAttribute('x1') || '0');
        const y1 = parseFloat(el.getAttribute('y1') || '0');
        const x2 = parseFloat(el.getAttribute('x2') || '0');
        const y2 = parseFloat(el.getAttribute('y2') || '0');
        return `M ${x1} ${y1} L ${x2} ${y2}`;
      }

      case 'polygon':
      case 'polyline': {
        const points = el.getAttribute('points')?.trim();
        if (!points) return null;
        const coords = points.split(/[\s,]+/).filter((c) => c.length > 0);
        if (coords.length < 4) return null;

        const pairs: string[] = [];
        for (let i = 0; i < coords.length; i += 2) {
          if (coords[i + 1] !== undefined) {
            pairs.push(`${coords[i]} ${coords[i + 1]}`);
          }
        }

        const isClosed = tag === 'polygon';
        return `M ${pairs.join(' L ')}${isClosed ? ' Z' : ''}`;
      }

      default:
        return null;
    }
  }
}
