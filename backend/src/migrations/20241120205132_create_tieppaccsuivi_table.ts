import type { Knex } from "knex";

// we need to replace before_tiepp_id by tiepp_id
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tieppaccsuivi", function (table) {
    table.increments("suivi_id").primary();
    table.integer("tiepp_id").unsigned().notNullable();
    table.string("date_acc_suivi", 10).notNullable();
    table.string("typ_accompagnement_id").notNullable();
    table.string("hour_begin", 5).notNullable();
    table.string("hour_end", 5).notNullable();
    table.string("sujet_accompagnement_id").notNullable();
    table.text("feedback");
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("tiepp_id").references("tiepp.tiepp_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_tieppaccsuivi_update_date
        BEFORE UPDATE ON tieppaccsuivi
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tieppaccsuivi");
}
