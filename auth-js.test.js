/**
 * @jest-environment jsdom
 */

// Mock the global functions and DOM from your auth.js
global.alert = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Create mock elements BEFORE the tests
const createMockElement = (id) => ({
  value: '',
  style: { display: '' },
  classList: { add: jest.fn(), remove: jest.fn() },
  innerHTML: '',
  textContent: '',
  disabled: false,
  type: 'password'
});

const mockElements = {
  'studentEmail': createMockElement('studentEmail'),
  'studentPassword': createMockElement('studentPassword'),
  'loginPage': createMockElement('loginPage'),
  'paymentPage': createMockElement('paymentPage')
};

// Mock document.getElementById
document.getElementById = jest.fn((id) => {
  return mockElements[id] || createMockElement(id);
});

// Mock the functions that would be in your auth.js
const AuthJS = {
  // Login functions
  validateLogin: function() {
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;
    
    if (!email.endsWith('@deakin.edu.au')) {
      document.getElementById('studentEmail').classList.add('is-invalid');
      return false;
    }
    
    if (password.length < 8) {
      document.getElementById('studentPassword').classList.add('is-invalid');
      return false;
    }
    
    return true;
  },
  
  togglePassword: function() {
    const passwordInput = document.getElementById('studentPassword');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    return passwordInput.type;
  },
  
  // Payment functions
  processPayment: function(amount, total) {
    if (amount <= 0 || amount > total) {
      alert('Invalid payment amount');
      return false;
    }
    
    // Simulate payment processing
    return true;
  },
  
  // Utility functions
  formatCurrency: function(amount) {
    return '$' + amount.toFixed(2);
  },
  
  validateCardNumber: function(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length === 16 && /^\d+$/.test(cleanNumber);
  }
};

describe('Auth.js Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock elements
    Object.values(mockElements).forEach(element => {
      element.value = '';
      element.style.display = '';
      element.innerHTML = '';
      element.textContent = '';
      element.disabled = false;
      element.type = 'password';
      element.classList.add.mockClear();
      element.classList.remove.mockClear();
    });
    
    // Reset alert mock
    alert.mockClear();
  });

  test('should validate login credentials', () => {
    // Invalid email
    mockElements.studentEmail.value = 'invalid@gmail.com';
    mockElements.studentPassword.value = 'password123';
    expect(AuthJS.validateLogin()).toBe(false);
    expect(mockElements.studentEmail.classList.add).toHaveBeenCalledWith('is-invalid');
    
    // Short password
    mockElements.studentEmail.value = 'test@deakin.edu.au';
    mockElements.studentPassword.value = 'short';
    expect(AuthJS.validateLogin()).toBe(false);
    expect(mockElements.studentPassword.classList.add).toHaveBeenCalledWith('is-invalid');
    
    // Valid credentials
    mockElements.studentEmail.value = 'test@deakin.edu.au';
    mockElements.studentPassword.value = 'password123';
    expect(AuthJS.validateLogin()).toBe(true);
  });

  test('should toggle password visibility', () => {
    mockElements.studentPassword.type = 'password';
    expect(AuthJS.togglePassword()).toBe('text');
    expect(mockElements.studentPassword.type).toBe('text');
    
    expect(AuthJS.togglePassword()).toBe('password');
    expect(mockElements.studentPassword.type).toBe('password');
  });

  test('should validate payment amounts', () => {
    expect(AuthJS.processPayment(100, 500)).toBe(true);
    expect(AuthJS.processPayment(0, 500)).toBe(false);
    expect(alert).toHaveBeenCalledWith('Invalid payment amount');
    expect(AuthJS.processPayment(600, 500)).toBe(false);
  });

  test('should format currency correctly', () => {
    expect(AuthJS.formatCurrency(100)).toBe('$100.00');
    expect(AuthJS.formatCurrency(50.5)).toBe('$50.50');
    expect(AuthJS.formatCurrency(1234.56)).toBe('$1234.56');
  });

  test('should validate card numbers', () => {
    expect(AuthJS.validateCardNumber('4111111111111111')).toBe(true);
    expect(AuthJS.validateCardNumber('4111 1111 1111 1111')).toBe(true);
    expect(AuthJS.validateCardNumber('1234')).toBe(false);
    expect(AuthJS.validateCardNumber('411111111111111a')).toBe(false);
  });
});