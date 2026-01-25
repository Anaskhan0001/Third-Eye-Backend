#!/usr/bin/env node

/**
 * MongoDB Connection Verification Script
 * Checks if MongoDB Atlas is properly configured and accessible
 * Run: node verify-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n📊 MongoDB Atlas Connection Verification\n');
console.log('=' .repeat(50));

// Check if MONGODB_URI is configured
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Extract connection details from URI
const uri = process.env.MONGODB_URI;
console.log('✅ MONGODB_URI found in .env');
console.log(`   Connection String (partially): ${uri.substring(0, 50)}...`);

// Extract database name
const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
const dbName = dbMatch ? dbMatch[1] : 'unknown';
console.log(`✅ Database: ${dbName}`);

// Attempt connection
console.log('\n🔄 Attempting to connect to MongoDB Atlas...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
}).then(conn => {
  console.log('✅ Connection Successful!');
  console.log(`   Host: ${conn.connection.host}`);
  console.log(`   Database: ${conn.connection.db.databaseName}`);
  console.log(`   Collections accessible:`);
  
  // List collections
  conn.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('   ❌ Could not list collections:', err.message);
    } else {
      if (collections.length === 0) {
        console.log('   ⚠️  No collections found yet');
        console.log('      (Create some data via API to see collections)');
      } else {
        collections.forEach(col => {
          console.log(`   - ${col.name}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ MongoDB is ready for development!\n');
    console.log('Next steps:');
    console.log('1. Install "MongoDB for VS Code" extension');
    console.log('2. Add connection with the URI above');
    console.log('3. Browse collections in VS Code sidebar\n');
    
    mongoose.connection.close();
    process.exit(0);
  });
}).catch(error => {
  console.error('❌ Connection Failed!');
  console.error(`   Error: ${error.message}`);
  console.error('\n🔧 Troubleshooting:');
  console.error('   1. Check IP whitelist in MongoDB Atlas');
  console.error('   2. Verify username and password in connection string');
  console.error('   3. Ensure database name is correct');
  console.error('   4. Check network connectivity to MongoDB Atlas\n');
  
  process.exit(1);
});
