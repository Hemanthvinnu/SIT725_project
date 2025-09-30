/**
 * @jest-environment jsdom
 */

// Create a proper DOM mock
const createMockElement = (id) => ({
    value: '',
    style: { display: '' },
    classList: { 
      add: jest.fn(), 
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    innerHTML: '',
    textContent: '',
    disabled: false,
    type: 'password'
  });
  
  // Mock DOM elements
  const mockElements = {
    'loginPage': createMockElement('loginPage'),
    'paymentPage': createMockElement('paymentPage'),
    'studentEmail': createMockElement('studentEmail'),
    'studentPassword': createMockElement('studentPassword'),
    'loginBtn': createMockElement('loginBtn'),
    'emailError': createMockElement('emailError'),
    'passwordError': createMockElement('passwordError'),
    'loggedInUser': createMockElement('loggedInUser'),
    'studentName': createMockElement('studentName'),
    'studentId': createMockElement('studentId'),
    'studentCourse': createMockElement('studentCourse'),
    'enrolledUnits': createMockElement('enrolledUnits'),
    'feeTableBody': createMockElement('feeTableBody'),
    'totalPayable': createMockElement('totalPayable'),
    'paymentTotal': createMockElement('paymentTotal'),
    'dueDate': createMockElement('dueDate'),
    'paymentAmount': createMockElement('paymentAmount')
  };
  
  // Mock document.getElementById
  document.getElementById = jest.fn((id) => mockElements[id] || createMockElement(id));
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  global.localStorage = localStorageMock;
  global.alert = jest.fn();
  
  // Application functions to test
  const AppFunctions = {
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
    
    showPaymentPage: function() {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('paymentPage').style.display = 'block';
      return true;
    },
    
    logout: function() {
      document.getElementById('paymentPage').style.display = 'none';
      document.getElementById('loginPage').style.display = 'flex';
      return true;
    },
    
    calculateTotal: function(fees) {
      return fees.reduce((sum, fee) => sum + fee.amount, 0);
    },
    
    processPayment: function(amount, total) {
      if (amount <= 0 || amount > total) {
        return { success: false, error: 'Invalid amount' };
      }
      return { success: true, message: 'Payment processed' };
    }
  };
  
  describe('DeakinPay Application', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Reset all mock elements
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
      
      // Set initial states
      mockElements.loginPage.style.display = 'flex';
      mockElements.paymentPage.style.display = 'none';
      mockElements.studentPassword.type = 'password';
    });
  
    test('should validate login form correctly', () => {
      // Test invalid email
      mockElements.studentEmail.value = 'invalid@email.com';
      mockElements.studentPassword.value = 'password123';
      expect(AppFunctions.validateLogin()).toBe(false);
      expect(mockElements.studentEmail.classList.add).toHaveBeenCalledWith('is-invalid');
      
      // Test short password
      mockElements.studentEmail.value = 'test@deakin.edu.au';
      mockElements.studentPassword.value = 'short';
      expect(AppFunctions.validateLogin()).toBe(false);
      expect(mockElements.studentPassword.classList.add).toHaveBeenCalledWith('is-invalid');
      
      // Test valid credentials
      mockElements.studentEmail.value = 'test@deakin.edu.au';
      mockElements.studentPassword.value = 'password123';
      expect(AppFunctions.validateLogin()).toBe(true);
    });
  
    test('should toggle password visibility', () => {
      expect(AppFunctions.togglePassword()).toBe('text');
      expect(mockElements.studentPassword.type).toBe('text');
      
      expect(AppFunctions.togglePassword()).toBe('password');
      expect(mockElements.studentPassword.type).toBe('password');
    });
  
    test('should navigate between login and payment pages', () => {
      expect(AppFunctions.showPaymentPage()).toBe(true);
      expect(mockElements.loginPage.style.display).toBe('none');
      expect(mockElements.paymentPage.style.display).toBe('block');
      
      expect(AppFunctions.logout()).toBe(true);
      expect(mockElements.loginPage.style.display).toBe('flex');
      expect(mockElements.paymentPage.style.display).toBe('none');
    });
  
    test('should calculate payment totals correctly', () => {
      const fees = [
        { description: 'Tuition', amount: 1000 },
        { description: 'Services', amount: 200 },
        { description: 'Library', amount: 50 }
      ];
      
      const total = AppFunctions.calculateTotal(fees);
      expect(total).toBe(1250);
      
      // Test empty array
      expect(AppFunctions.calculateTotal([])).toBe(0);
      
      // Test single fee
      expect(AppFunctions.calculateTotal([{ description: 'Test', amount: 500 }])).toBe(500);
    });
  
    test('should process payments with validation', () => {
      // Valid payment
      const result1 = AppFunctions.processPayment(100, 500);
      expect(result1.success).toBe(true);
      expect(result1.message).toBe('Payment processed');
      
      // Invalid payment (amount too high)
      const result2 = AppFunctions.processPayment(600, 500);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Invalid amount');
      
      // Invalid payment (zero amount)
      const result3 = AppFunctions.processPayment(0, 500);
      expect(result3.success).toBe(false);
      
      // Invalid payment (negative amount)
      const result4 = AppFunctions.processPayment(-100, 500);
      expect(result4.success).toBe(false);
      
      // Exact amount payment
      const result5 = AppFunctions.processPayment(500, 500);
      expect(result5.success).toBe(true);
    });
  });