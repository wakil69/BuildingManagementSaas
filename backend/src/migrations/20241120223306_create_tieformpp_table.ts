import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tieformpp", function (table) {
    table.increments("form_pp_id").primary();
    table.integer("tiepp_id").unsigned().notNullable();
    table.string("formule_id").notNullable();
    table.string("date_debut_formule", 10).notNullable();
    table.string("date_fin_formule", 10);
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("tiepp_id").references("tiepp.tiepp_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_tieformpp_update_date
        BEFORE UPDATE ON tieformpp
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tieformpp");
}
