/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['src'],
  logHeapUsage: false,
  detectLeaks: false,
  detectOpenHandles: true,
  testTimeout: 15000,
  testRegex: '\\.spec\\.[jt]sx?$',
  rootDir: '..',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  setupFiles: ['<rootDir>/.jest/env.js']
};