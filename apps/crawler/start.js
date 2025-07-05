#!/usr/bin/env node

// Load environment variables before anything else
require('dotenv').config();

// Now run the main application
const { main } = require('./dist/index.js');
main();