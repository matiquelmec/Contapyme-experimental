// 🧹 Jest Global Teardown - Executed once after all test suites
module.exports = async () => {
  console.log('🧹 Tearing down Jest testing environment...');

  // Clean up test database
  // Clean up any global test resources
  // Close any open connections

  console.log('✅ Jest global teardown completed');
};