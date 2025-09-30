/**
 * @jest-environment jsdom
 */

const { authFunctions, getAuthContent, getDatabaseContent, getServerContent, getGlobeContent } = require('./coverage-wrapper');

describe('Coverage Wrapper Test', () => {
  test('auth-functions exports work', () => {
    expect(authFunctions.validateLogin).toBeDefined();
    expect(authFunctions.calculateTotalPayable).toBeDefined();
    expect(authFunctions.formatCardNumber).toBeDefined();
  });

  test('auth-functions validateLogin works', () => {
    const result = authFunctions.validateLogin('s224967779@deakin.edu.au', 'Deakin2025');
    expect(result.success).toBe(true);
  });

  test('auth-functions calculateTotalPayable works', () => {
    const fees = [{ amount: 100 }, { amount: 200 }];
    const total = authFunctions.calculateTotalPayable(fees);
    expect(total).toBe(300);
  });

  test('auth-functions formatCardNumber works', () => {
    const formatted = authFunctions.formatCardNumber('4111111111111111');
    expect(formatted).toBe('4111 1111 1111 1111');
  });

  test('file contents can be read', () => {
    const authContent = getAuthContent();
    const dbContent = getDatabaseContent();
    const serverContent = getServerContent();
    const globeContent = getGlobeContent();

    expect(authContent.length).toBeGreaterThan(0);
    expect(dbContent.length).toBeGreaterThan(0);
    expect(serverContent.length).toBeGreaterThan(0);
    expect(globeContent.length).toBeGreaterThan(0);
  });
});