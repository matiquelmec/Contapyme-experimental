/** @type {import('lint-staged').Config} */
module.exports = {
  // 📝 TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    // 1. Format with Prettier first
    'prettier --write',
    // 2. Fix ESLint issues
    'eslint --fix',
    // 3. Type check (only for staged files)
    () => 'tsc --noEmit',
  ],

  // 🎨 Style files
  '*.{css,scss,sass}': [
    'prettier --write',
  ],

  // 📄 Config and documentation files
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],

  // 📦 Package.json specific checks
  'package.json': [
    'prettier --write',
    // Check for security vulnerabilities in dependencies
    () => 'npm audit --audit-level moderate',
    // Check for outdated dependencies (non-breaking)
    () => 'npm outdated --depth=0 || true',
  ],

  // 🧪 Test files - ensure tests are not broken
  '*.{test,spec}.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
    // Run tests only for the changed test files
    (filenames) => `jest --findRelatedTests ${filenames.join(' ')} --passWithNoTests`,
  ],

  // 📱 Next.js specific files
  'next.config.js': [
    'prettier --write',
    'eslint --fix',
  ],

  // 🎯 Tailwind config
  'tailwind.config.js': [
    'prettier --write',
    'eslint --fix',
  ],

  // 🔧 ESLint config
  '.eslintrc.js': [
    'prettier --write',
  ],

  // 🎨 Prettier config
  '.prettierrc.js': [
    'prettier --write',
  ],

  // 📋 TypeScript config
  'tsconfig.json': [
    'prettier --write',
    // Validate TypeScript config
    () => 'tsc --noEmit --project tsconfig.json',
  ],
};