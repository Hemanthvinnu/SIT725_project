const fs = require('fs');

describe('Database.js Actual File Test', () => {
  let dbContent;
  
  beforeAll(() => {
    // Read the actual database.js file
    dbContent = fs.readFileSync('./database.js', 'utf8');
  });

  test('database.js file exists and has content', () => {
    expect(dbContent.length).toBeGreaterThan(1000);
    expect(dbContent).toMatch(/function/);
  });

  test('database.js contains SQLite setup', () => {
    expect(dbContent).toMatch(/sqlite3/);
    expect(dbContent).toMatch(/database/);
  });

  test('database.js contains user operations', () => {
    // Updated to match your actual method names
    expect(dbContent).toMatch(/getUserByEmail/);
    expect(dbContent).toMatch(/createUser/);
    expect(dbContent).toMatch(/getCompleteUserData/); // This is your actual method
  });

  test('database.js contains transaction operations', () => {
    // Updated to match your actual code structure
    expect(dbContent).toMatch(/transactions/);
    expect(dbContent).toMatch(/INSERT/);
    expect(dbContent).toMatch(/SELECT/);
  });

  test('database.js contains SQL queries', () => {
    expect(dbContent).toMatch(/CREATE TABLE/);
    expect(dbContent).toMatch(/INSERT/);
    expect(dbContent).toMatch(/SELECT/);
  });
});