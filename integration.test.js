/**
 * @jest-environment jsdom
 */

const { 
    validateLogin, 
    getStudentProfile, 
    calculateTotalPayable,
    isValidPaymentAmount,
    testAccounts 
  } = require('./auth-functions');
  
  describe('DeakinPay Integration Tests', () => {
    test('complete student login to payment flow', () => {
      // Step 1: Student logs in
      const loginResult = validateLogin("s224967779@deakin.edu.au", "Deakin2025");
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.name).toBe("Valeh Moghaddam");
      
      // Step 2: Retrieve student profile
      const profile = getStudentProfile(loginResult.user.email);
      expect(profile).not.toBeNull();
      expect(profile.course).toBe("Master of Information Technology");
      
      // Step 3: Calculate fees
      const totalFees = calculateTotalPayable(profile.fees);
      expect(totalFees).toBe(3765.00);
      
      // Step 4: Validate payment amounts
      expect(isValidPaymentAmount(totalFees, totalFees)).toBe(true); // Full payment
      expect(isValidPaymentAmount(1000, totalFees)).toBe(true); // Partial payment
      expect(isValidPaymentAmount(totalFees + 100, totalFees)).toBe(false); // Overpayment
      
      // Step 5: Verify student can access all features
      expect(profile.units.length).toBeGreaterThan(0);
      expect(profile.fees.length).toBeGreaterThan(0);
      expect(profile.transactions.length).toBeGreaterThan(0);
    });
  
    test('multiple student accounts work correctly', () => {
      testAccounts.forEach(account => {
        // Test login for each account
        const loginResult = validateLogin(account.email, account.password);
        expect(loginResult.success).toBe(true);
        
        // Test profile retrieval
        const profile = getStudentProfile(account.email);
        expect(profile).not.toBeNull();
        expect(profile.name).toBe(account.name);
        expect(profile.id).toBe(account.id);
        
        // Test fee calculation
        const total = calculateTotalPayable(profile.fees);
        expect(total).toBeGreaterThan(0);
      });
    });
  
    test('error handling for invalid operations', () => {
      // Test invalid login attempts
      const invalidLogins = [
        { email: 'invalid@email.com', password: 'password123' },
        { email: 'test@deakin.edu.au', password: 'short' },
        { email: '', password: '' },
        { email: 'test@deakin.edu.au', password: 'wrongpassword' }
      ];
      
      invalidLogins.forEach(attempt => {
        const result = validateLogin(attempt.email, attempt.password);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
      
      // Test invalid payment scenarios
      const invalidPayments = [
        { amount: 0, max: 100 },
        { amount: -50, max: 100 },
        { amount: 150, max: 100 },
        { amount: 0, max: 0 }
      ];
      
      invalidPayments.forEach(payment => {
        expect(isValidPaymentAmount(payment.amount, payment.max)).toBe(false);
      });
    });
  });