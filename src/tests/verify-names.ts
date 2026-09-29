import { SvgFile } from '../domain/entities/SvgFile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing SvgFile.toValidAndroidFileName ---');
assert(
  SvgFile.toValidAndroidFileName('My Icon #1.svg') === 'ic_my_icon_1.xml',
  'Sanitizes special characters to snake_case'
);

assert(
  SvgFile.toValidAndroidFileName('ic_alarm.svg') === 'ic_alarm.xml',
  'Does not duplicate ic_ prefix'
);

assert(
  SvgFile.toValidAndroidFileName('User-Profile (Dark).svg') === 'ic_user_profile_dark.xml',
  'Replaces dashes and parens with underscores'
);

assert(
  SvgFile.toValidAndroidFileName('___weird___name___.svg') === 'ic_weird_name.xml',
  'Cleans up trailing and duplicate underscores'
);

console.log('All naming tests passed!');
