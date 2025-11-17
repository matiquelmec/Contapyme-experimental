// 🧪 Jest Setup - ContaPyme Enterprise Testing Configuration

// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Import Jest Extended for additional matchers
import 'jest-extended';

// 🔧 Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
  debug: process.env.NODE_ENV === 'test' ? jest.fn() : console.debug,
  info: process.env.NODE_ENV === 'test' ? jest.fn() : console.info,
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};

// 🌐 Mock window object properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
};

// 📱 Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// 🌍 Mock fetch API
global.fetch = jest.fn();

// 📍 Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
});

// 📋 Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// 🔊 Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 100,
}));

// 🎯 Mock URL constructor
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// 📊 Mock Chart.js if used (comentado porque no está instalado)
// jest.mock('chart.js', () => ({
//   Chart: {
//     register: jest.fn(),
//   },
//   CategoryScale: jest.fn(),
//   LinearScale: jest.fn(),
//   BarElement: jest.fn(),
//   Title: jest.fn(),
//   Tooltip: jest.fn(),
//   Legend: jest.fn(),
// }));

// 📄 Mock PDF libraries
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
    addPage: jest.fn(),
    setPage: jest.fn(),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297),
      },
    },
  })),
}));

// 📊 Mock Excel libraries
jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: jest.fn().mockReturnValue({
      columns: [],
      addRow: jest.fn(),
      getCell: jest.fn().mockReturnValue({
        value: '',
        style: {},
      }),
    }),
    xlsx: {
      writeBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(8))),
    },
  })),
}));

// 🔗 Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(() => Promise.resolve()),
      replace: jest.fn(() => Promise.resolve()),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(() => Promise.resolve()),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// 🔗 Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// 🖼️ Mock Next.js Image component
jest.mock('next/image', () => {
  const MockedImage = ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
  MockedImage.displayName = 'MockedNextImage';
  return MockedImage;
});

// 🔗 Mock Next.js Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
  MockedLink.displayName = 'MockedNextLink';
  return MockedLink;
});

// 🎨 Mock Lucide React icons
jest.mock('lucide-react', () => {
  const createMockIcon = (name) => {
    const MockIcon = (props) => <span data-testid={`${name}-icon`} {...props} />;
    MockIcon.displayName = `Mock${name}`;
    return MockIcon;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return createMockIcon(prop);
        }
        return target[prop];
      },
    }
  );
});

// 🗄️ Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

// 🧮 Set up test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NODE_ENV = 'test';

// 🔄 Global test helpers
global.testHelpers = {
  // Wait for async operations
  wait: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),

  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@contapyme.cl',
    name: 'Test User',
    role: 'CLIENT',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  // Create mock company
  createMockCompany: (overrides = {}) => ({
    id: 'company-123',
    name: 'Test Company',
    rut: '12345678-9',
    address: 'Test Address',
    phone: '+56912345678',
    email: 'company@test.cl',
    ...overrides,
  }),
};

// 🏁 Test lifecycle hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset localStorage and sessionStorage
  localStorageMock.clear();

  // Reset fetch mock
  global.fetch.mockClear();
});

afterEach(() => {
  // Clean up any side effects after each test
  jest.restoreAllMocks();
});

// 🎯 Global test configuration
jest.setTimeout(10000); // 10 second timeout for all tests

// 📊 Custom Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

console.log('✅ Jest setup completed - ContaPyme testing environment ready!');