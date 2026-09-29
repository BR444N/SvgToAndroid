import { ColorUtils } from '../infrastructure/converter/ColorUtils';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing ColorUtils.normalizeColor ---');
assert(ColorUtils.normalizeColor('#fff') === '#FFFFFF', 'Normalizes 3-char hex');
assert(ColorUtils.normalizeColor('#ffffff') === '#FFFFFF', 'Normalizes 6-char hex');
assert(ColorUtils.normalizeColor('black') === '#000000', 'Normalizes named color black');
assert(ColorUtils.normalizeColor('none') === null, 'None returns null');
assert(ColorUtils.normalizeColor('rgb(255, 0, 0)') === '#FF0000', 'Normalizes rgb');
assert(ColorUtils.normalizeColor('rgba(255, 255, 255, 0.5)') === '#80FFFFFF', 'Normalizes rgba to #AARRGGBB');
assert(ColorUtils.normalizeColor('transparent') === null, 'Transparent returns null');

console.log('All color tests passed!');
