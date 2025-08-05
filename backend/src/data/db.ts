import knex, { Knex } from "knex";
import config from "../knexfile";
import mysql from "mysql2/promise"; 
import dotenv from "dotenv";
dotenv.config();

const db: Knex = knex(config);

const waitForDb = async () => {
  const connectionConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };


  while (true) {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      console.log("Database is ready to accept connections.");
      await connection.end();
      break;
    } catch (err) {
      console.log(connectionConfig, "db config")
      console.error("Waiting for the database to be ready... Retrying in 2 seconds.");
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
  }
};

const runLatestMigrations = async () => {
  try {
    await waitForDb();
    await db.migrate.latest();
    console.log("Migrations are up to date.");
  } catch (err) {
    console.error("Error running migrations:", err);
    throw err;
  }
};

export { db, runLatestMigrations };
