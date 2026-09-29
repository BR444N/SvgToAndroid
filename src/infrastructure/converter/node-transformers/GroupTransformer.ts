import type { INodeTransformer, TransformContext } from './INodeTransformer';

export class GroupTransformer implements INodeTransformer {
  public canTransform(node: Element): boolean {
    return node.tagName.toLowerCase() === 'g';
  }

  public transform(
    node: Element,
    context: TransformContext,
    transformChildren: (el: Element, ctx: TransformContext) => string[]
  ): string[] {
    const indent = '  '.repeat(context.depth);
    const childContext: TransformContext = {
      depth: context.depth + 1,
      inheritedFill: node.getAttribute('fill') ?? context.inheritedFill,
      inheritedStroke: node.getAttribute('stroke') ?? context.inheritedStroke,
      inheritedStrokeWidth: node.getAttribute('stroke-width') ?? context.inheritedStrokeWidth,
    };

    const groupAttrs: string[] = [];
    const transformAttr = node.getAttribute('transform');
    if (transformAttr) {
      this.parseTransforms(transformAttr, groupAttrs);
    }

    const idAttr = node.getAttribute('id');
    if (idAttr) {
      groupAttrs.push(`android:name="${idAttr.replace(/[^a-zA-Z0-9_]/g, '_')}"`);
    }

    const childrenXml: string[] = [];
    for (const child of Array.from(node.children)) {
      childrenXml.push(...transformChildren(child, childContext));
    }

    if (childrenXml.length === 0) return [];

    // Si no tiene atributos de transformación ni nombre, podemos omitir la etiqueta <group> para simplificar el XML
    if (groupAttrs.length === 0) {
      return childrenXml;
    }

    const formattedAttrs = groupAttrs.map((a) => `\n${indent}    ${a}`).join('');
    return [
      `${indent}<group${formattedAttrs}>`,
      ...childrenXml,
      `${indent}</group>`,
    ];
  }

  private parseTransforms(transformStr: string, outAttrs: string[]): void {
    // translate(tx [, ty])
    const translateMatch = transformStr.match(/translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/);
    if (translateMatch) {
      outAttrs.push(`android:translateX="${translateMatch[1]}"`);
      if (translateMatch[2]) {
        outAttrs.push(`android:translateY="${translateMatch[2]}"`);
      }
    }

    // scale(sx [, sy])
    const scaleMatch = transformStr.match(/scale\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/);
    if (scaleMatch) {
      outAttrs.push(`android:scaleX="${scaleMatch[1]}"`);
      outAttrs.push(`android:scaleY="${scaleMatch[2] ?? scaleMatch[1]}"`);
    }

    // rotate(angle [, cx, cy])
    const rotateMatch = transformStr.match(/rotate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?(?:[\s,]+([-\d.]+))?\s*\)/);
    if (rotateMatch) {
      outAttrs.push(`android:rotation="${rotateMatch[1]}"`);
      if (rotateMatch[2]) outAttrs.push(`android:pivotX="${rotateMatch[2]}"`);
      if (rotateMatch[3]) outAttrs.push(`android:pivotY="${rotateMatch[3]}"`);
    }
  }
}
