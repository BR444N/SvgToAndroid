import { BasicShapesTransformer } from '../infrastructure/converter/node-transformers/BasicShapesTransformer';

const transformer = new BasicShapesTransformer();

// Mock minimal element
function createMockEl(tag: string, attrs: Record<string, string>): Element {
  return {
    tagName: tag.toUpperCase(),
    getAttribute: (name: string) => attrs[name] ?? null,
  } as unknown as Element;
}

console.log('--- Testing BasicShapesTransformer.canTransform ---');
const shapes = ['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'];
for (const s of shapes) {
  const el = createMockEl(s, {});
  if (!transformer.canTransform(el)) {
    throw new Error(`Failed to recognize shape: ${s}`);
  }
  console.log(`✓ Recognizes <${s}>`);
}

const nonShape = createMockEl('path', {});
if (transformer.canTransform(nonShape)) {
  throw new Error('Should not transform <path>');
}
console.log('✓ Correctly rejects non-basic shape <path>');

console.log('All basic shape transformer tests passed!');
