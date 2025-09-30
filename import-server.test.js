const fs = require('fs');

describe('Server.js Actual File Test', () => {
  let serverContent;
  
  beforeAll(() => {
    // Read the actual server.js file
    serverContent = fs.readFileSync('./server.js', 'utf8');
  });

  test('server.js file exists and has content', () => {
    expect(serverContent.length).toBeGreaterThan(1000);
    expect(serverContent).toMatch(/function/);
  });

  test('server.js contains Express setup', () => {
    expect(serverContent).toMatch(/express/);
    expect(serverContent).toMatch(/require.*express/);
  });

  test('server.js contains route definitions', () => {
    expect(serverContent).toMatch(/app\.(get|post|use)/);
  });

  test('server.js contains API endpoints', () => {
    expect(serverContent).toMatch(/\/api\//);
    expect(serverContent).toMatch(/login/);
    expect(serverContent).toMatch(/payment/);
  });

  test('server.js contains server startup', () => {
    expect(serverContent).toMatch(/listen/);
    expect(serverContent).toMatch(/PORT/);
  });
});