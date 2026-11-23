module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/integration', '<rootDir>/performance'],
  testMatch: ['**/*.spec.ts'],
  // Resolve workspace packages from source so the tests do not depend on a prior build.
  moduleNameMapper: {
    '^@frontend-observability/(sdk|analytics-engine)$': '<rootDir>/../$1/src',
  },
};
