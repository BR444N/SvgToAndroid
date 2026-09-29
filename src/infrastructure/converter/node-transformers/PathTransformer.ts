import type { INodeTransformer, TransformContext } from './INodeTransformer';
import { ColorUtils } from '../ColorUtils';

export class PathTransformer implements INodeTransformer {
  public canTransform(node: Element): boolean {
    return node.tagName.toLowerCase() === 'path';
  }

  public transform(node: Element, context: TransformContext): string[] {
    const pathData = node.getAttribute('d')?.trim();
    if (!pathData) return [];

    const indent = '  '.repeat(context.depth);
    const attrs: string[] = [];

    // 1. pathData obligatorio en Android Vector
    attrs.push(`android:pathData="${this.escapeXml(pathData)}"`);

    // 2. Extracción de stroke (atributos o inline style)
    const strokeVal = this.getStyleOrAttr(node, 'stroke') ?? context.inheritedStroke;
    const isStrokeNone = !strokeVal || strokeVal.toLowerCase() === 'none' || strokeVal.toLowerCase() === 'transparent';
    const strokeColor = !isStrokeNone ? ColorUtils.normalizeColor(strokeVal) : null;

    // 3. Extracción de fill (atributos o inline style)
    const fillVal = this.getStyleOrAttr(node, 'fill') ?? context.inheritedFill;
    const isFillNone = fillVal !== undefined && fillVal !== null && (fillVal.toLowerCase() === 'none' || fillVal.toLowerCase() === 'transparent');

    if (!isFillNone) {
      // Si no es "none", normalizamos el color o usamos negro si no hay stroke
      const fillColor = fillVal ? ColorUtils.normalizeColor(fillVal) : (!strokeColor ? '#FF000000' : null);
      if (fillColor) {
        attrs.push(`android:fillColor="${fillColor}"`);
      }

      const fillAlpha = this.getStyleOrAttr(node, 'fill-opacity');
      if (fillAlpha && !isNaN(parseFloat(fillAlpha))) {
        attrs.push(`android:fillAlpha="${fillAlpha}"`);
      }
    }

    // 4. Si tiene stroke configurado
    if (strokeColor) {
      attrs.push(`android:strokeColor="${strokeColor}"`);

      const strokeWidth = this.getStyleOrAttr(node, 'stroke-width') ?? context.inheritedStrokeWidth ?? '1';
      attrs.push(`android:strokeWidth="${parseFloat(strokeWidth) || 1}"`);

      const strokeAlpha = this.getStyleOrAttr(node, 'stroke-opacity');
      if (strokeAlpha) {
        attrs.push(`android:strokeAlpha="${strokeAlpha}"`);
      }

      const strokeLinecap = this.getStyleOrAttr(node, 'stroke-linecap');
      if (strokeLinecap) {
        attrs.push(`android:strokeLineCap="${strokeLinecap}"`);
      }

      const strokeLinejoin = this.getStyleOrAttr(node, 'stroke-linejoin');
      if (strokeLinejoin) {
        attrs.push(`android:strokeLineJoin="${strokeLinejoin}"`);
      }
    }

    // 5. Regla de relleno (fill-rule / clip-rule)
    const fillRule = this.getStyleOrAttr(node, 'fill-rule') || this.getStyleOrAttr(node, 'clip-rule');
    if (fillRule === 'evenodd') {
      attrs.push(`android:fillType="evenOdd"`);
    }

    const formattedAttrs = attrs.map((a) => `\n${indent}    ${a}`).join('');
    return [`${indent}<path${formattedAttrs} />`];
  }

  private getStyleOrAttr(element: Element, attrName: string): string | null {
    const directAttr = element.getAttribute(attrName);
    if (directAttr !== null && directAttr !== '') {
      return directAttr;
    }
    const style = element.getAttribute('style');
    if (style) {
      const regex = new RegExp(`(?:^|;)\\s*${attrName}\\s*:\\s*([^;]+)`, 'i');
      const match = style.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
