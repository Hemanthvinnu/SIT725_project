// Test credentials
const testAccounts = [
  { email: "s224967779@deakin.edu.au", password: "Deakin2025", name: "Valeh Moghaddam", id: "s224967779" },
  { email: "demo@deakin.edu.au", password: "password123", name: "Demo Student", id: "s220000000" }
];

// Student data
const studentData = {
  name: "Valeh Moghaddam",
  id: "s224967779",
  email: "s224967779@deakin.edu.au",
  course: "Master of Information Technology",
  semester: "Trimester 2, 2025",
  status: "Active - Full Time",
  units: ["SIT774 - Applied Software Engineering", "SIT722 - Software Deployment and Operation", "SIT753 - Professional Practice in IT"],
  fees: [
    { description: "Tuition Fee - Trimester 2, 2025", amount: 3450.00, dueDate: "15/08/2025", status: "Pending" },
    { description: "Student Services and Amenities Fee", amount: 315.00, dueDate: "15/08/2025", status: "Pending" }
  ],
  transactions: [
    { date: "15/06/2025", description: "Tuition Fee - Trimester 1, 2025", amount: 3450.00, type: "debit" },
    { date: "10/05/2025", description: "Student Services and Amenities Fee", amount: 315.00, type: "debit" }
  ]
};

// Authentication functions
function validateLogin(email, password) {
  if (!email.endsWith('@deakin.edu.au')) {
    return { success: false, error: 'Please use your Deakin email' };
  }
  
  if (password.length < 8) {
    return { success: false, error: 'Password must be 8+ characters' };
  }
  
  const matchedAccount = testAccounts.find(account => 
    account.email === email && account.password === password
  );
  
  if (matchedAccount) {
    return { success: true, user: matchedAccount };
  } else {
    return { success: false, error: 'Invalid email or password' };
  }
}

function togglePassword(currentType) {
  return currentType === 'password' ? 'text' : 'password';
}

function fillTestCredentials(accountIndex) {
  const account = testAccounts[accountIndex - 1];
  return { email: account.email, password: account.password };
}

function calculateTotalPayable(fees) {
  return fees.reduce((sum, fee) => sum + fee.amount, 0);
}

function formatCardNumber(cardNumber) {
  let value = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = '';
  
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += ' ';
    }
    formattedValue += value[i];
  }
  
  return formattedValue;
}

function formatExpiryDate(expiry) {
  let value = expiry.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  // Only add slash if we have at least 2 characters
  if (value.length >= 2) {
    // For exactly 2 characters, don't add the slash yet
    if (value.length === 2) {
      return value;
    }
    return value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  
  return value;
}

function isValidPaymentAmount(amount, maxAmount) {
  return amount > 0 && amount <= maxAmount;
}

function getStudentProfile(email) {
  const account = testAccounts.find(acc => acc.email === email);
  if (account) {
    return {
      ...studentData,
      name: account.name,
      id: account.id,
      email: account.email
    };
  }
  return null;
}

// Export functions for testing
module.exports = {
  testAccounts,
  studentData,
  validateLogin,
  togglePassword,
  fillTestCredentials,
  calculateTotalPayable,
  formatCardNumber,
  formatExpiryDate,
  isValidPaymentAmount,
  getStudentProfile
};