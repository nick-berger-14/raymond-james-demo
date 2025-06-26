const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const newman = require('newman');

const dbPath = './data/testdb.sqlite';
const outputPath = './output/data.json';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    return console.error('Failed to connect to SQLite DB:', err.message);
  }
  console.log('✅ Connected to SQLite database.');
});

const query = `SELECT customerEmail, depositAmount FROM deposits LIMIT 10`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Query failed:', err.message);
    db.close();
    return;
  }

  // Write JSON file
  fs.mkdirSync('./output', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
  console.log(`✅ Data written to ${outputPath}`);

  // Run Newman
  newman.run({
    collection: './postman/collections/24490171-9fd0a8bf-a7ec-40c6-8ee0-f7dd700a1d7a.json',
    iterationData: outputPath,
    reporters: ['cli', 'json'],
    reporter: {
      json: { export: './output/report.json' }
    }
  }, (err, summary) => {
    if (err) throw err;
    console.log('🧪 Newman run complete.');
    db.close();
  });
});
