// 🌐 Jest Global Setup - Executed once before all test suites
module.exports = async () => {
  console.log('🚀 Setting up Jest testing environment for ContaPyme...');

  // Set up test database if needed
  // Set up test environment variables
  // Initialize any global test resources

  // Mock environment for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

  console.log('✅ Jest global setup completed');
};