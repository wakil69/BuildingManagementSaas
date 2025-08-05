import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("notifications", function (table) {
    table.increments("notification_id").primary();
    table.integer("company_id").unsigned().notNullable();
    table.integer("conv_id").unsigned().notNullable();

    table.unique(["conv_id", "company_id"], {
      indexName: "unique_conv_id_company",
    });

    table.foreign("company_id").references("companies.company_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("notifications");
}
