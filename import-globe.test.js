const fs = require('fs');

describe('Globe.js Actual File Test', () => {
  let globeContent;
  
  beforeAll(() => {
    // Read the actual globe.js file
    globeContent = fs.readFileSync('./globe.js', 'utf8');
  });

  test('globe.js file exists and has content', () => {
    expect(globeContent.length).toBeGreaterThan(1000);
    expect(globeContent).toMatch(/function/);
  });

  test('globe.js contains Three.js or WebGL references', () => {
    expect(globeContent).toMatch(/Three|WebGL|globe/i);
  });

  test('globe.js contains initialization functions', () => {
    expect(globeContent).toMatch(/init|create|setup/i);
  });

  test('globe.js contains visualization logic', () => {
    expect(globeContent).toMatch(/render|animate|draw/i);
  });
});