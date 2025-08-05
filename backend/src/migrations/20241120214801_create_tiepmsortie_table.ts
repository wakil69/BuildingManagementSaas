import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tiepmsortie", function (table) {
    table.increments("sortie_id").primary();
    table.integer("tiepm_id").unsigned().notNullable();
    table.string("date_sortie", 10).notNullable();
    table.string("motif_id").notNullable();
    table.string("new_implantation");
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("tiepm_id").references("tiepm.tiepm_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_tiepmsortie_update_date
        BEFORE UPDATE ON tiepmsortie
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tiepmsortie");
}
