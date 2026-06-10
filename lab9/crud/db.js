const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

const dbPath = path.resolve(__dirname, "data_dev.db");
const db = new DatabaseSync(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS syringe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    capacity INTEGER NOT NULL,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    description TEXT
  );
`);

module.exports = db;
