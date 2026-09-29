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

    // pathData obligatorio
    attrs.push(`android:pathData="${this.escapeXml(pathData)}"`);

    // fill y fill-opacity
    const fillAttr = node.getAttribute('fill') ?? context.inheritedFill ?? '#000000';
    const fillColor = ColorUtils.normalizeColor(fillAttr);
    if (fillColor) {
      attrs.push(`android:fillColor="${fillColor}"`);
    }

    const fillAlpha = node.getAttribute('fill-opacity');
    if (fillAlpha && !isNaN(parseFloat(fillAlpha))) {
      attrs.push(`android:fillAlpha="${fillAlpha}"`);
    }

    // stroke y stroke-width
    const strokeAttr = node.getAttribute('stroke') ?? context.inheritedStroke;
    const strokeColor = ColorUtils.normalizeColor(strokeAttr);
    if (strokeColor) {
      attrs.push(`android:strokeColor="${strokeColor}"`);

      const strokeWidth = node.getAttribute('stroke-width') ?? context.inheritedStrokeWidth ?? '1';
      attrs.push(`android:strokeWidth="${parseFloat(strokeWidth) || 1}"`);

      const strokeAlpha = node.getAttribute('stroke-opacity');
      if (strokeAlpha) {
        attrs.push(`android:strokeAlpha="${strokeAlpha}"`);
      }

      const strokeLinecap = node.getAttribute('stroke-linecap');
      if (strokeLinecap) {
        attrs.push(`android:strokeLineCap="${strokeLinecap}"`);
      }

      const strokeLinejoin = node.getAttribute('stroke-linejoin');
      if (strokeLinejoin) {
        attrs.push(`android:strokeLineJoin="${strokeLinejoin}"`);
      }
    }

    // fill-rule (evenodd / nonzero)
    const fillRule = node.getAttribute('fill-rule') || node.getAttribute('clip-rule');
    if (fillRule === 'evenodd') {
      attrs.push(`android:fillType="evenOdd"`);
    }

    const formattedAttrs = attrs.map((a) => `\n${indent}    ${a}`).join('');
    return [`${indent}<path${formattedAttrs} />`];
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
