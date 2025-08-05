import { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const connection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
};


const config: Knex.Config = {
  client: "mysql2",
  connection,
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "migrations"),
  },
  useNullAsDefault: true,
};

export default config;
