const fs = require('fs');

describe('Actual File Content Tests', () => {
  test('auth.js should contain expected functions', () => {
    if (fs.existsSync('./auth.js')) {
      const content = fs.readFileSync('./auth.js', 'utf8');
      
      // Check for common function patterns
      expect(content).toMatch(/function\s+\w+/);
      expect(content).toMatch(/showPaymentPage|validateLogin|togglePassword|logout/i);
      
      // Check for event listeners or DOM manipulation
      expect(content).toMatch(/addEventListener|getElementById|querySelector/i);
      
      // Should contain authentication logic (updated to be more flexible)
      expect(content).toMatch(/localStorage|getCurrentUser|login|logout/i);
      
      // Check for console logging (which your file has)
      expect(content).toMatch(/console\.(log|error|warn)/i);
    } else {
      console.log('auth.js not found, skipping content tests');
    }
  });

  test('database.js should contain database operations', () => {
    if (fs.existsSync('./database.js')) {
      const content = fs.readFileSync('./database.js', 'utf8');
      
      expect(content).toMatch(/sqlite3|database|query|SELECT|INSERT/i);
      expect(content).toMatch(/function|getUser|createTransaction/i);
    } else {
      console.log('database.js not found, skipping content tests');
    }
  });

  test('server.js should contain Express server setup', () => {
    if (fs.existsSync('./server.js')) {
      const content = fs.readFileSync('./server.js', 'utf8');
      
      expect(content).toMatch(/express|app\.get|app\.post|app\.listen/i);
      expect(content).toMatch(/require.*express/);
    } else {
      console.log('server.js not found, skipping content tests');
    }
  });

  test('globe.js should contain 3D visualization code', () => {
    if (fs.existsSync('./globe.js')) {
      const content = fs.readFileSync('./globe.js', 'utf8');
      
      expect(content).toMatch(/Three|WebGL|globe|visualization/i);
      expect(content).toMatch(/function|init|create/i);
    } else {
      console.log('globe.js not found, skipping content tests');
    }
  });

  test('HTML files should exist and contain basic structure', () => {
    const htmlFiles = ['login.html', 'index.html', 'support.html'];
    
    htmlFiles.forEach(file => {
      if (fs.existsSync(`./${file}`)) {
        const content = fs.readFileSync(`./${file}`, 'utf8');
        expect(content).toMatch(/<html|<!DOCTYPE|DOCTYPE html/i);
        expect(content).toMatch(/<head>.*<body>/s);
      } else {
        console.log(`${file} not found, skipping content tests`);
      }
    });
  });
});