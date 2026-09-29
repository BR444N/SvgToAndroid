export interface TransformContext {
  depth: number;
  inheritedFill?: string;
  inheritedStroke?: string;
  inheritedStrokeWidth?: string;
}

export interface INodeTransformer {
  /**
   * Determina si este transformador puede procesar el nodo dado.
   */
  canTransform(node: Element): boolean;

  /**
   * Transforma el nodo SVG a elementos XML de Android Vector Drawable.
   */
  transform(node: Element, context: TransformContext, transformChildren: (el: Element, ctx: TransformContext) => string[]): string[];
}
