/**
 * Script to populate the reportEmails.json config file with existing email addresses
 * from environment variables
 * 
 * Run with: node scripts/populate-config.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const configPath = path.join(__dirname, '..', 'app', 'config', 'reportEmails.json');

// Read existing config
const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);

// Populate with environment variable values
for (let i = 1; i <= 10; i++) {
  const envEmail = process.env[`EMAIL_${i}`];
  if (envEmail && config.reportEmails[i.toString()]) {
    // Extract just the email (remove comments)
    const cleanEmail = envEmail.split('#')[0].trim();
    config.reportEmails[i.toString()].email = cleanEmail;
  }
}

// Update metadata
config.lastUpdated = new Date().toISOString();
config.updatedBy = 'Migration Script';

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ Configuration file updated successfully!');
console.log('Email addresses imported:');
Object.entries(config.reportEmails).forEach(([id, report]) => {
  console.log(`  ${report.reportName}: ${report.email || '(not set)'}`);
});
