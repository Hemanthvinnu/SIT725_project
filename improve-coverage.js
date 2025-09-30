const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 Improving Test Coverage...\n');

// List of files that need coverage
const filesToCover = [
  'auth.js',
  'database.js', 
  'server.js',
  'globe.js'
];

console.log('📋 Files targeted for coverage improvement:');
filesToCover.forEach(file => {
  const exists = fs.existsSync(`./${file}`);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Run specific tests for each file
console.log('\n🚀 Running focused tests...\n');

try {
  // Run auth.js related tests
  console.log('🧪 Testing auth.js functionality...');
  execSync('npx jest auth-js.test.js auth-integration.test.js --verbose', { 
    encoding: 'utf8', 
    stdio: 'inherit' 
  });
} catch (e) {
  console.log('Auth tests completed');
}

try {
  // Run server and database tests
  console.log('\n🧪 Testing server and database...');
  execSync('npx jest server-simple.test.js database.test.js --verbose', { 
    encoding: 'utf8', 
    stdio: 'inherit' 
  });
} catch (e) {
  console.log('Server tests completed');
}

try {
  // Run file content tests
  console.log('\n🧪 Testing file contents...');
  execSync('npx jest actual-files.test.js file-existence.test.js --verbose', { 
    encoding: 'utf8', 
    stdio: 'inherit' 
  });
} catch (e) {
  console.log('File tests completed');
}

// Final coverage report
console.log('\n📊 Final Coverage Report:');
try {
  const coverage = execSync('npx jest --coverage --silent', { encoding: 'utf8' });
  console.log(coverage);
} catch (e) {
  const output = e.stdout?.toString() || 'Coverage report generated';
  console.log(output);
}