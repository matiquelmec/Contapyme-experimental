/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // 🎯 Setup and Environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // 📁 Module paths and mappings
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    // Handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // 🧪 Test files patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
  ],

  // 🚫 Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/ejemplo*',
  ],

  // 📋 Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/app/**/page.tsx', // Next.js pages
    '!src/app/**/layout.tsx', // Next.js layouts
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/globals.css',
    '!src/types/**/*',
    '!src/lib/data/**/*', // Static data files
  ],

  // 📊 Coverage thresholds (enterprise standards)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical modules
    'src/components/': {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    'src/hooks/': {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    'src/lib/': {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },

  // 📄 Coverage reports
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
    'clover',
  ],

  // 📂 Coverage directory
  coverageDirectory: 'coverage',

  // 🔍 Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],

  // 🏃‍♂️ Test running configuration
  verbose: true,
  maxWorkers: '50%', // Use half of available CPU cores
  testTimeout: 10000, // 10 seconds timeout per test

  // 🎭 Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // 📝 Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],

  // 🔧 Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // 📦 Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // 🎨 Handle static assets - combinado con configuración anterior
  // moduleNameMapper ya está definido arriba

  // ⚙️ Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',

  // 🔄 Watch mode configuration
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],

  // 🎯 Setup for different types of tests
  projects: [
    // Unit tests
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.e2e.{test,spec}.{js,jsx,ts,tsx}',
      ],
    },
    // Integration tests
    {
      displayName: 'Integration Tests',
      testMatch: [
        '<rootDir>/src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '<rootDir>/jest.integration.setup.js',
      ],
    },
  ],

  // 🏷️ Test tags and categorization
  runner: 'jest-runner',

  // 📈 Performance and optimization
  cacheDirectory: '<rootDir>/.jest-cache',

  // 🚫 Ignore patterns for watch mode
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],

  // 🎪 Error handling
  errorOnDeprecated: true,

  // 📊 Collect coverage from untested files
  collectCoverageFrom: [
    ...require('next/jest')().collectCoverageFrom || [],
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);