'use strict';

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.DATABASE_URI = process.env.MLAB_URI_DEV;
  process.env.PORT = 5000;
} else if (env === 'test') {
  process.env.DATABASE_URI = 'mongodb://localhost:27017/test-sputnik-db';
} else if (env === 'production') {
  process.env.DATABASE_URI = process.env.MLAB_URI_PROD;
}

let dataBaseName = process.env.DATABASE_URI.slice(
  process.env.DATABASE_URI.lastIndexOf('/') + 1
);

console.log('ENVIRONMENT: ', env);
console.log('DATABSE: ', dataBaseName);
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
