module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@src/(.*)': '<rootDir>/src/$1',
    
    '^@config/(.*)': '<rootDir>/src/config/$1',
    '^@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '^@interfaces/(.*)': '<rootDir>/src/interfaces/$1',
    '^@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
    '^@models/(.*)': '<rootDir>/src/models/$1',
    '^@routes/(.*)': '<rootDir>/src/routes/$1',
    '^@services/(.*)': '<rootDir>/src/services/$1',
    '^@tests/(.*)': '<rootDir>/src/tests/$1',
    '^@utils/(.*)': '<rootDir>/src/utils/$1',
    '^@validations/(.*)': '<rootDir>/src/validations/$1',


  },
  testMatch: ['**/*.test.ts'],
};
