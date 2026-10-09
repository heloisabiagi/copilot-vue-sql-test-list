const transform = {
  '^.+\\.js$': 'babel-jest',
  '^.+\\.vue$': '@vue/vue3-jest'
};
const moduleFileExtensions = ['js', 'json', 'jsx', 'node'];

module.exports = {
  projects: [
    {
      displayName: 'ui',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/api/'],
      transform,
      moduleFileExtensions
    },
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/api/**/*.test.js'],
      setupFiles: ['<rootDir>/__tests__/api/setupEnv.js'],
      transform,
      moduleFileExtensions
    }
  ]
};
