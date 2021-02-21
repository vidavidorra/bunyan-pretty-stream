module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['cobertura', 'lcov', 'text'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
};
