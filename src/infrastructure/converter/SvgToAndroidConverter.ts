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
    // Principio Abierto/Cerrado (O): Podemos inyectar nuevos transformadores sin modificar la clase
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

    // Transformar elementos hijos
    const context: TransformContext = { depth: 1 };
    const childrenXml: string[] = [];

    for (const child of Array.from(svgRoot.children)) {
      childrenXml.push(...this.transformElement(child, context));
    }

    // Cabecera Vector Drawable
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

    const xmlLines = [
      '<!-- Generated with SVG to Android Vector Drawable Converter -->',
      `<vector\n    ${vectorAttrs.join('\n    ')}>`,
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
}
