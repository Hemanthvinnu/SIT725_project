// Mock database operations based on your database.js
const mockDatabase = {
    // Mock database functions
    initialize: jest.fn(),
    
    getUserByEmail: function(email) {
      const users = [
        { id: 1, email: 's224967779@deakin.edu.au', password: 'Deakin2025', name: 'Valeh Moghaddam', student_id: 's224967779' },
        { id: 2, email: 'demo@deakin.edu.au', password: 'password123', name: 'Demo Student', student_id: 's220000000' }
      ];
      return Promise.resolve(users.find(user => user.email === email));
    },
    
    getUserFees: function(studentId) {
      const fees = [
        { id: 1, student_id: 's224967779', description: 'Tuition Fee', amount: 3450.00, due_date: '2025-08-15', status: 'Pending' },
        { id: 2, student_id: 's224967779', description: 'Student Services', amount: 315.00, due_date: '2025-08-15', status: 'Pending' }
      ];
      return Promise.resolve(fees.filter(fee => fee.student_id === studentId));
    },
    
    createTransaction: function(transaction) {
      return Promise.resolve({
        id: 1,
        ...transaction,
        created_at: new Date().toISOString()
      });
    }
  };
  
  describe('Database Operations', () => {
    test('should get user by email', async () => {
      const user = await mockDatabase.getUserByEmail('s224967779@deakin.edu.au');
      
      expect(user).toBeDefined();
      expect(user.name).toBe('Valeh Moghaddam');
      expect(user.student_id).toBe('s224967779');
    });
  
    test('should return undefined for non-existent user', async () => {
      const user = await mockDatabase.getUserByEmail('nonexistent@deakin.edu.au');
      expect(user).toBeUndefined();
    });
  
    test('should get user fees', async () => {
      const fees = await mockDatabase.getUserFees('s224967779');
      
      expect(fees).toHaveLength(2);
      expect(fees[0].description).toBe('Tuition Fee');
      expect(fees[0].amount).toBe(3450.00);
    });
  
    test('should create transaction', async () => {
      const transaction = {
        student_id: 's224967779',
        amount: 100.00,
        type: 'payment',
        description: 'Test Payment',
        method: 'credit'
      };
      
      const result = await mockDatabase.createTransaction(transaction);
      
      expect(result).toHaveProperty('id');
      expect(result.student_id).toBe('s224967779');
      expect(result.amount).toBe(100.00);
    });
  });