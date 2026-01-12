module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
    '^user/(.*)$': '<rootDir>/user/$1',
    '^auth/(.*)$': '<rootDir>/auth/$1',
    '^role/(.*)$': '<rootDir>/role/$1',
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^interop/(.*)$': '<rootDir>/interop/$1',
    '^nodemailer/(.*)$': '<rootDir>/nodemailer/$1',
  },
};
