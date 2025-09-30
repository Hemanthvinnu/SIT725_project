const { 
    getStudentProfile, 
    testAccounts,
    studentData 
  } = require('./auth-functions');
  
  describe('Student Management', () => {
    test('should retrieve student profiles for all test accounts', () => {
      testAccounts.forEach(account => {
        const profile = getStudentProfile(account.email);
        expect(profile).not.toBeNull();
        expect(profile.name).toBe(account.name);
        expect(profile.id).toBe(account.id);
        expect(profile.email).toBe(account.email);
      });
    });
  
    test('should maintain original student data structure', () => {
      const profile = getStudentProfile("s224967779@deakin.edu.au");
      
      expect(profile.course).toBe(studentData.course);
      expect(profile.semester).toBe(studentData.semester);
      expect(profile.status).toBe(studentData.status);
      expect(profile.units).toEqual(studentData.units);
      expect(profile.fees).toEqual(studentData.fees);
      expect(profile.transactions).toEqual(studentData.transactions);
    });
  
    test('should handle non-existent students gracefully', () => {
      const nonExistentEmails = [
        'unknown@deakin.edu.au',
        'test@test.com',
        '',
        null,
        undefined
      ];
      
      nonExistentEmails.forEach(email => {
        const profile = getStudentProfile(email);
        expect(profile).toBeNull();
      });
    });
  
    test('should have consistent unit enrollment data', () => {
      const profile = getStudentProfile("s224967779@deakin.edu.au");
      
      expect(Array.isArray(profile.units)).toBe(true);
      expect(profile.units.length).toBeGreaterThan(0);
      
      profile.units.forEach(unit => {
        expect(typeof unit).toBe('string');
        expect(unit.length).toBeGreaterThan(0);
      });
    });
  
    test('should have valid fee structure', () => {
      const profile = getStudentProfile("s224967779@deakin.edu.au");
      
      expect(Array.isArray(profile.fees)).toBe(true);
      
      profile.fees.forEach(fee => {
        expect(fee).toHaveProperty('description');
        expect(fee).toHaveProperty('amount');
        expect(fee).toHaveProperty('dueDate');
        expect(fee).toHaveProperty('status');
        expect(typeof fee.amount).toBe('number');
        expect(fee.amount).toBeGreaterThan(0);
      });
    });
  });