import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("ugetages", function (table) {
    table.increments("etage_id").primary();
    table.integer("batiment_id").unsigned().notNullable();
    table.integer("company_id").unsigned().notNullable();
    table.integer("num_etage").notNullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.unique(["batiment_id", "company_id", "num_etage"], {
      indexName: "unique_batiment_company_etage",
    });
    
    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("company_id").references("companies.company_id");
    table.foreign("batiment_id").references("ugbats.batiment_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("ugetages");
}
