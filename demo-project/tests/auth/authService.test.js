const bcrypt = require('bcryptjs');
const { loginUser } = require('../../src/auth/authService');

describe('loginUser', () => {
  const password = 'correct-horse-battery-staple';
  let userRecord;

  beforeAll(async () => {
    userRecord = {
      id: 'user-001',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash(password, 10),
      role: 'user'
    };
  });

  it('throws Invalid credentials for a wrong password', async () => {
    await expect(loginUser(userRecord.email, 'wrong-password', userRecord))
      .rejects.toThrow('Invalid credentials');
  });

  it('throws Invalid credentials when no user record is found', async () => {
    await expect(loginUser('nobody@example.com', password, undefined))
      .rejects.toThrow('Invalid credentials');
  });

  it('returns tokens and user info for the correct password', async () => {
    const result = await loginUser(userRecord.email, password, userRecord);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user).toEqual({
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role
    });
  });
});
