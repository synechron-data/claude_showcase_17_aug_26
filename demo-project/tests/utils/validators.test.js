const {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUUID,
  sanitizeString
} = require('../../src/utils/validators');

describe('validatePhoneNumber', () => {
  it('accepts a plain digit string within 7-15 digits', () => {
    expect(validatePhoneNumber('9876543210')).toBe(true);
  });

  it('accepts a number with a leading +', () => {
    expect(validatePhoneNumber('+19876543210')).toBe(true);
  });

  it('accepts numbers formatted with spaces, hyphens, and parentheses', () => {
    expect(validatePhoneNumber('+1 (987) 654-3210')).toBe(true);
  });

  it('rejects strings that are too short', () => {
    expect(validatePhoneNumber('12345')).toBe(false);
  });

  it('rejects strings that are too long', () => {
    expect(validatePhoneNumber('1234567890123456')).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    expect(validatePhoneNumber('987-abc-3210')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(validatePhoneNumber(9876543210)).toBe(false);
    expect(validatePhoneNumber(null)).toBe(false);
    expect(validatePhoneNumber(undefined)).toBe(false);
  });
});

describe('validateEmail', () => {
  test('accepts a standard email address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('accepts an email with a multi-part domain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  test('accepts an email surrounded by whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });

  test('rejects an email missing the @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('rejects an email missing the domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  test('rejects an email missing the local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  test('rejects an email missing the TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  test('rejects an email containing a space', () => {
    expect(validateEmail('user name@example.com')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('rejects a whitespace-only string', () => {
    expect(validateEmail('   ')).toBe(false);
  });

  test('rejects non-string input', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(12345)).toBe(false);
    expect(validateEmail({})).toBe(false);
    expect(validateEmail([])).toBe(false);
  });
});

describe('validatePassword', () => {
  test('accepts a password at the minimum length boundary', () => {
    expect(validatePassword('abcdefgh')).toBe(true);
  });

  test('accepts a password longer than the minimum length', () => {
    expect(validatePassword('a-much-longer-password')).toBe(true);
  });

  test('rejects a password one character below the minimum length', () => {
    expect(validatePassword('abcdefg')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(validatePassword('')).toBe(false);
  });

  test('rejects non-string input', () => {
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
    expect(validatePassword(12345678)).toBe(false);
    expect(validatePassword({})).toBe(false);
    expect(validatePassword([])).toBe(false);
  });
});

describe('validateUUID', () => {
  test('accepts a well-formed UUID v4 string', () => {
    expect(validateUUID('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
  });

  test('accepts a well-formed UUID v4 string in uppercase', () => {
    expect(validateUUID('123E4567-E89B-42D3-A456-426614174000')).toBe(true);
  });

  test('rejects a UUID with a non-v4 version nibble', () => {
    expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
  });

  test('rejects a UUID with an invalid variant nibble', () => {
    expect(validateUUID('123e4567-e89b-42d3-1456-426614174000')).toBe(false);
  });

  test('rejects a UUID missing hyphens', () => {
    expect(validateUUID('123e4567e89b42d3a456426614174000')).toBe(false);
  });

  test('rejects an arbitrary non-UUID string', () => {
    expect(validateUUID('not-a-uuid')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(validateUUID('')).toBe(false);
  });

  test('rejects non-string input', () => {
    expect(validateUUID(null)).toBe(false);
    expect(validateUUID(undefined)).toBe(false);
    expect(validateUUID(12345)).toBe(false);
    expect(validateUUID({})).toBe(false);
    expect(validateUUID([])).toBe(false);
  });
});

describe('sanitizeString', () => {
  test('trims leading and trailing whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  test('removes control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld');
    expect(sanitizeString('hello\x1Fworld')).toBe('helloworld');
    expect(sanitizeString('hello\x7Fworld')).toBe('helloworld');
  });

  test('returns an empty string for an empty string input', () => {
    expect(sanitizeString('')).toBe('');
  });

  test('returns an empty string for a whitespace-only input', () => {
    expect(sanitizeString('   ')).toBe('');
  });

  test('returns an empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(12345)).toBe('');
    expect(sanitizeString({})).toBe('');
    expect(sanitizeString([])).toBe('');
  });
});
