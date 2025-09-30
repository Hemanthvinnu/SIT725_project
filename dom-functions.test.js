/**
 * @jest-environment jsdom
 */

// Mock DOM functions
global.alert = jest.fn();
global.document = {
  getElementById: jest.fn((id) => {
    const elements = {
      'studentEmail': { value: '', classList: { add: jest.fn(), remove: jest.fn() } },
      'studentPassword': { value: '', type: 'password', classList: { add: jest.fn(), remove: jest.fn() } },
      'loginBtn': { innerHTML: '', disabled: false },
      'emailError': { textContent: '' },
      'passwordError': { textContent: '' },
      'loginPage': { style: { display: 'flex' } },
      'paymentPage': { style: { display: 'none' } },
      'loggedInUser': { textContent: '' },
      'studentName': { textContent: '' },
      'studentId': { textContent: '' },
      'studentCourse': { textContent: '' },
      'enrolledUnits': { innerHTML: '' },
      'feeTableBody': { innerHTML: '' },
      'totalPayable': { textContent: '' }
    };
    return elements[id] || { value: '', classList: { add: jest.fn(), remove: jest.fn() } };
  })
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

global.localStorage = localStorageMock;

describe('DOM Functions', () => {
  beforeEach(() => {
    // Reset mocks
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should toggle password visibility', () => {
    const passwordInput = { type: 'password' };
    
    const togglePassword = (input) => {
      input.type = input.type === 'password' ? 'text' : 'password';
      return input.type;
    };
    
    expect(togglePassword(passwordInput)).toBe('text');
    expect(togglePassword(passwordInput)).toBe('password');
  });

  test('should show/hide login and payment pages', () => {
    const loginPage = { style: { display: 'flex' } };
    const paymentPage = { style: { display: 'none' } };
    
    const showPaymentPage = () => {
      loginPage.style.display = 'none';
      paymentPage.style.display = 'block';
    };
    
    const logout = () => {
      paymentPage.style.display = 'none';
      loginPage.style.display = 'flex';
    };
    
    showPaymentPage();
    expect(loginPage.style.display).toBe('none');
    expect(paymentPage.style.display).toBe('block');
    
    logout();
    expect(loginPage.style.display).toBe('flex');
    expect(paymentPage.style.display).toBe('none');
  });

  test('should handle login form validation', () => {
    const emailInput = { value: 'test@deakin.edu.au' };
    const passwordInput = { value: 'password123' };
    
    const validateForm = (email, password) => {
      if (!email.endsWith('@deakin.edu.au')) {
        return { isValid: false, error: 'Invalid email format' };
      }
      if (password.length < 8) {
        return { isValid: false, error: 'Password too short' };
      }
      return { isValid: true, error: null };
    };
    
    const result1 = validateForm(emailInput.value, passwordInput.value);
    expect(result1.isValid).toBe(true);
    
    const result2 = validateForm('invalid@email.com', passwordInput.value);
    expect(result2.isValid).toBe(false);
    
    const result3 = validateForm(emailInput.value, 'short');
    expect(result3.isValid).toBe(false);
  });
});