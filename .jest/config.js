/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['src'],
  logHeapUsage: true,
  detectLeaks: true,
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