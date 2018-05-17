const path = require('path');

exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;
exports.twitterAppKey = process.env.TWITTER_APP_KEY;
exports.twitterAppSecret = process.env.TWITTER_APP_SECRET;
exports.twitterAuthEnabled = exports.twitterAppKey && exports.twitterAppSecret;
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk
