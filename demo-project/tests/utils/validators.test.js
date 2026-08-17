const { validatePhoneNumber } = require('../../src/utils/validators');

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
