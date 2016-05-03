exports.config = {
  framework: 'mocha',
  mochaOpts: {
     timeout: 30000
  },
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
  	'tests/e2e/login.test.js',
  	'tests/e2e/home.test.js'
  ]
};