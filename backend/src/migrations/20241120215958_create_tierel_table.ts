import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tierel", function (table) {
    table.increments("rel_id").primary();
    table.integer("tiepp_id").unsigned().notNullable();
    table.integer("tiepm_id").unsigned().notNullable();
    table.string("rel_typ_id");
    table.string("relation_date_debut", 10);
    table.string("relation_date_fin", 10);
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("tiepm_id").references("tiepm.tiepm_id");
    table.foreign("tiepp_id").references("tiepp.tiepp_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_tierel_update_date
        BEFORE UPDATE ON tierel
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tierel");
}
