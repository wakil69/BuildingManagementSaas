import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("companies", (table) => {
    table.increments("company_id").primary();
    table.string("raison_sociale").notNullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("companies");
}
