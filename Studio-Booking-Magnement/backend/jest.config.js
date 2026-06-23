module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/supabase/schema.sql'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
