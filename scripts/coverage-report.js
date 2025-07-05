#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to generate a combined coverage report from all apps
 */

const apps = ['crawler', 'admin', 'web'];
const coverageData = {};

// Collect coverage data from each app
apps.forEach(app => {
  const coveragePath = path.join(__dirname, '..', 'apps', app, 'coverage', 'coverage-summary.json');
  
  if (fs.existsSync(coveragePath)) {
    const data = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    coverageData[app] = data.total;
  }
});

// Calculate combined totals
const combined = {
  lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
  statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
  functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
  branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
};

Object.values(coverageData).forEach(data => {
  ['lines', 'statements', 'functions', 'branches'].forEach(metric => {
    combined[metric].total += data[metric].total;
    combined[metric].covered += data[metric].covered;
    combined[metric].skipped += data[metric].skipped;
  });
});

// Calculate percentages
['lines', 'statements', 'functions', 'branches'].forEach(metric => {
  combined[metric].pct = combined[metric].total > 0
    ? (combined[metric].covered / combined[metric].total * 100).toFixed(2)
    : 0;
});

// Generate report
console.log('\n=== SpaceCrawler Test Coverage Report ===\n');

// Individual app coverage
console.log('Coverage by App:');
console.log('─'.repeat(60));

Object.entries(coverageData).forEach(([app, data]) => {
  console.log(`\n${app.toUpperCase()}:`);
  console.log(`  Lines:      ${data.lines.pct}% (${data.lines.covered}/${data.lines.total})`);
  console.log(`  Statements: ${data.statements.pct}% (${data.statements.covered}/${data.statements.total})`);
  console.log(`  Functions:  ${data.functions.pct}% (${data.functions.covered}/${data.functions.total})`);
  console.log(`  Branches:   ${data.branches.pct}% (${data.branches.covered}/${data.branches.total})`);
});

// Combined coverage
console.log('\n' + '═'.repeat(60));
console.log('\nCOMBINED COVERAGE:');
console.log(`  Lines:      ${combined.lines.pct}% (${combined.lines.covered}/${combined.lines.total})`);
console.log(`  Statements: ${combined.statements.pct}% (${combined.statements.covered}/${combined.statements.total})`);
console.log(`  Functions:  ${combined.functions.pct}% (${combined.functions.covered}/${combined.functions.total})`);
console.log(`  Branches:   ${combined.branches.pct}% (${combined.branches.covered}/${combined.branches.total})`);

// Coverage threshold check
const threshold = 80;
const allMetricsMeetThreshold = ['lines', 'statements', 'functions', 'branches']
  .every(metric => parseFloat(combined[metric].pct) >= threshold);

console.log('\n' + '═'.repeat(60));
if (allMetricsMeetThreshold) {
  console.log(`\n✅ All metrics meet the ${threshold}% coverage threshold!`);
} else {
  console.log(`\n❌ Some metrics are below the ${threshold}% coverage threshold.`);
  process.exit(1);
}

// Generate badge data
const badgeData = {
  schemaVersion: 1,
  label: 'coverage',
  message: `${combined.lines.pct}%`,
  color: parseFloat(combined.lines.pct) >= 80 ? 'brightgreen' : 
         parseFloat(combined.lines.pct) >= 60 ? 'yellow' : 'red'
};

fs.writeFileSync(
  path.join(__dirname, '..', 'coverage-badge.json'),
  JSON.stringify(badgeData, null, 2)
);

console.log('\n📊 Coverage badge data written to coverage-badge.json');
console.log('\n');