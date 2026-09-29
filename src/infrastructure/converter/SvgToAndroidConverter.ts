import type { ISvgConverter, SvgConvertOptions } from '../../domain/ports/ISvgConverter';
import type { SvgFile } from '../../domain/entities/SvgFile';
import { VectorDrawable, type VectorDrawableOptions } from '../../domain/entities/VectorDrawable';
import type { INodeTransformer, TransformContext } from './node-transformers/INodeTransformer';
import { PathTransformer } from './node-transformers/PathTransformer';
import { BasicShapesTransformer } from './node-transformers/BasicShapesTransformer';
import { GroupTransformer } from './node-transformers/GroupTransformer';

export class SvgToAndroidConverter implements ISvgConverter {
  private transformers: INodeTransformer[];

  constructor(customTransformers?: INodeTransformer[]) {
    // Principio Abierto/Cerrado (O): Soporta inyección de transformadores
    this.transformers = customTransformers ?? [
      new GroupTransformer(),
      new PathTransformer(),
      new BasicShapesTransformer(),
    ];
  }

  public async convert(svgFile: SvgFile, options?: SvgConvertOptions): Promise<VectorDrawable> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgFile.sanitizedContent, 'application/xml');
    const svgRoot = doc.documentElement;

    const widthDp = (options?.overrideWidth ?? options?.widthDp ?? Math.round(svgFile.metadata.width)) || 24;
    const heightDp = (options?.overrideHeight ?? options?.heightDp ?? Math.round(svgFile.metadata.height)) || 24;
    const viewportWidth = (options?.viewportWidth ?? svgFile.metadata.viewportWidth) || widthDp;
    const viewportHeight = (options?.viewportHeight ?? svgFile.metadata.viewportHeight) || heightDp;

    const vectorOptions: VectorDrawableOptions = {
      widthDp,
      heightDp,
      viewportWidth,
      viewportHeight,
      tintColor: options?.tintColor,
      autoMirrored: options?.autoMirrored,
    };

    // Heredar estilos iniciales desde el nodo raíz <svg> (ej: fill="none", stroke="currentColor")
    const rootFill = this.getStyleOrAttr(svgRoot, 'fill');
    const rootStroke = this.getStyleOrAttr(svgRoot, 'stroke');
    const rootStrokeWidth = this.getStyleOrAttr(svgRoot, 'stroke-width');

    const context: TransformContext = {
      depth: 1,
      inheritedFill: rootFill ?? undefined,
      inheritedStroke: rootStroke ?? undefined,
      inheritedStrokeWidth: rootStrokeWidth ?? undefined,
    };

    // Transformar elementos hijos
    const childrenXml: string[] = [];
    for (const child of Array.from(svgRoot.children)) {
      childrenXml.push(...this.transformElement(child, context));
    }

    // Cabecera Vector Drawable según especificación oficial de Android
    const vectorAttrs = [
      'xmlns:android="http://schemas.android.com/apk/res/android"',
      `android:width="${widthDp}dp"`,
      `android:height="${heightDp}dp"`,
      `android:viewportWidth="${viewportWidth}"`,
      `android:viewportHeight="${viewportHeight}"`,
    ];

    if (vectorOptions.tintColor) {
      vectorAttrs.push(`android:tint="${vectorOptions.tintColor}"`);
    }
    if (vectorOptions.autoMirrored) {
      vectorAttrs.push(`android:autoMirrored="true"`);
    }

    // Formato exacto listo para pegar directamente en Android (.xml) sin comentarios
    const xmlLines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      `<vector ${vectorAttrs.join('\n    ')}>`,
      ...childrenXml,
      '</vector>',
    ];

    const xmlContent = xmlLines.join('\n');
    return new VectorDrawable(
      svgFile.id,
      svgFile.metadata.sanitizedAndroidName,
      xmlContent,
      vectorOptions
    );
  }

  private transformElement = (element: Element, context: TransformContext): string[] => {
    for (const transformer of this.transformers) {
      if (transformer.canTransform(element)) {
        return transformer.transform(element, context, this.transformElement);
      }
    }
    return [];
  };

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
}
