/**
 * @jest-environment jsdom
 */

// Mock DOM functions
global.alert = jest.fn();
global.document = {
  getElementById: jest.fn(() => ({
    value: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }))
};

// Import functions using CommonJS
const {
  validateLogin,
  togglePassword,
  fillTestCredentials,
  calculateTotalPayable,
  formatCardNumber,
  formatExpiryDate,
  isValidPaymentAmount,
  getStudentProfile,
  testAccounts,
  studentData
} = require('./auth-functions');

describe('Authentication System', () => {
  test('should validate Deakin email format correctly', () => {
    const validEmail = "s224967779@deakin.edu.au";
    const invalidEmail = "invalid@gmail.com";
    
    const validResult = validateLogin(validEmail, "Deakin2025");
    const invalidResult = validateLogin(invalidEmail, "password123");
    
    expect(validResult.success).toBe(true);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toContain('Deakin email');
  });

  test('should validate password length', () => {
    const result = validateLogin("s224967779@deakin.edu.au", "short");
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('8+ characters');
  });

  test('should authenticate with correct credentials', () => {
    const result = validateLogin("s224967779@deakin.edu.au", "Deakin2025");
    
    expect(result.success).toBe(true);
    expect(result.user.name).toBe("Valeh Moghaddam");
    expect(result.user.id).toBe("s224967779");
  });

  test('should reject incorrect credentials', () => {
    const result = validateLogin("s224967779@deakin.edu.au", "wrongpassword");
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email or password');
  });

  test('should fill test credentials correctly', () => {
    const credentials1 = fillTestCredentials(1);
    const credentials2 = fillTestCredentials(2);
    
    expect(credentials1.email).toBe("s224967779@deakin.edu.au");
    expect(credentials1.password).toBe("Deakin2025");
    expect(credentials2.email).toBe("demo@deakin.edu.au");
    expect(credentials2.password).toBe("password123");
  });
});

describe('Password Visibility', () => {
  test('should toggle password visibility', () => {
    expect(togglePassword('password')).toBe('text');
    expect(togglePassword('text')).toBe('password');
  });
});

describe('Payment Calculations', () => {
  test('should calculate total payable amount correctly', () => {
    const total = calculateTotalPayable(studentData.fees);
    
    expect(total).toBe(3765.00);
    expect(total).toBeGreaterThan(0);
  });

  test('should validate payment amount', () => {
    expect(isValidPaymentAmount(100, 500)).toBe(true);
    expect(isValidPaymentAmount(600, 500)).toBe(false);
    expect(isValidPaymentAmount(0, 500)).toBe(false);
    expect(isValidPaymentAmount(-100, 500)).toBe(false);
  });
});

describe('Card Formatting', () => {
  test('should format card number correctly', () => {
    expect(formatCardNumber('1234567812345678')).toBe('1234 5678 1234 5678');
    expect(formatCardNumber('1234')).toBe('1234');
    expect(formatCardNumber('12345678')).toBe('1234 5678');
  });

  test('should format expiry date correctly', () => {
    expect(formatExpiryDate('1225')).toBe('12/25');
    expect(formatExpiryDate('12')).toBe('12');
    expect(formatExpiryDate('1')).toBe('1');
  });
});

describe('Student Profile', () => {
  test('should get student profile by email', () => {
    const profile = getStudentProfile("s224967779@deakin.edu.au");
    
    expect(profile).not.toBeNull();
    expect(profile.name).toBe("Valeh Moghaddam");
    expect(profile.course).toBe("Master of Information Technology");
    expect(profile.units).toHaveLength(3);
  });

  test('should return null for non-existent student', () => {
    const profile = getStudentProfile("nonexistent@deakin.edu.au");
    
    expect(profile).toBeNull();
  });
});

describe('Test Data Integrity', () => {
  test('test accounts should have valid structure', () => {
    testAccounts.forEach(account => {
      expect(account).toHaveProperty('email');
      expect(account).toHaveProperty('password');
      expect(account).toHaveProperty('name');
      expect(account).toHaveProperty('id');
      expect(account.email).toMatch(/@deakin\.edu\.au$/);
    });
  });

  test('student data should have complete information', () => {
    expect(studentData.fees).toBeInstanceOf(Array);
    expect(studentData.units).toBeInstanceOf(Array);
    expect(studentData.transactions).toBeInstanceOf(Array);
    expect(typeof studentData.course).toBe('string');
    expect(typeof studentData.semester).toBe('string');
  });
});

// Additional integration tests
describe('Integration Tests', () => {
  test('complete login to payment flow', () => {
    // Test login
    const loginResult = validateLogin("s224967779@deakin.edu.au", "Deakin2025");
    expect(loginResult.success).toBe(true);
    
    // Test profile retrieval
    const profile = getStudentProfile(loginResult.user.email);
    expect(profile).not.toBeNull();
    
    // Test payment calculation
    const total = calculateTotalPayable(profile.fees);
    expect(total).toBe(3765.00);
    
    // Test payment validation
    expect(isValidPaymentAmount(total, total)).toBe(true);
    expect(isValidPaymentAmount(total + 100, total)).toBe(false);
  });
});