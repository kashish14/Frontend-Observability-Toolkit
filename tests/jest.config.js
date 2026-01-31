module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/integration', '<rootDir>/performance'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {},
  collectCoverageFrom: [],
};
