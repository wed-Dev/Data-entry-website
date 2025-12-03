const serverless = require('serverless-http');
const app = require('../server-postgres');

// Export the serverless handler
module.exports = serverless(app);
