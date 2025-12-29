import sqlite_database from 'better-sqlite3'
const db = new sqlite_database('./imgDB.db')

export function load_imgDB(): sqlite_database.Database {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS images (
    path TEXT NOT NULL PRIMARY KEY,
    features BLOB
    )`
  ).run()
  return db
}
