const fs = require('fs');

describe('File Existence Check', () => {
  test('should have all required project files', () => {
    const requiredFiles = [
      'auth-functions.js',
      'auth.js',
      'package.json',
      'login.html'
    ];
    
    requiredFiles.forEach(file => {
      expect(fs.existsSync(`./${file}`)).toBe(true);
    });
  });

  test('should have valid package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    expect(packageJson).toHaveProperty('name');
    expect(packageJson).toHaveProperty('version');
    expect(packageJson).toHaveProperty('scripts');
    expect(packageJson.scripts).toHaveProperty('test');
    expect(packageJson.scripts).toHaveProperty('test:coverage');
  });

  test('should have test files', () => {
    const testFiles = [
      'auth.test.js',
      'app.test.js',
      'integration.test.js',
      'payment.test.js',
      'student.test.js',
      'dom-functions.test.js'
    ];
    
    testFiles.forEach(file => {
      expect(fs.existsSync(`./${file}`)).toBe(true);
    });
  });
});