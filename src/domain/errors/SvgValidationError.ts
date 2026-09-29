export enum SvgValidationErrorCode {
  INVALID_MIME_TYPE = 'INVALID_MIME_TYPE',
  INVALID_FILE_EXTENSION = 'INVALID_FILE_EXTENSION',
  EMPTY_FILE = 'EMPTY_FILE',
  MALFORMED_XML = 'MALFORMED_XML',
  NOT_AN_SVG_ROOT = 'NOT_AN_SVG_ROOT',
  MALICIOUS_SCRIPT_DETECTED = 'MALICIOUS_SCRIPT_DETECTED',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  SIZE_EXCEEDED = 'SIZE_EXCEEDED',
}

export class SvgValidationError extends Error {
  constructor(
    public readonly code: SvgValidationErrorCode,
    public readonly details: string,
    public readonly fileName?: string
  ) {
    super(`[${code}] ${fileName ? `${fileName}: ` : ''}${details}`);
    this.name = 'SvgValidationError';
  }
}
