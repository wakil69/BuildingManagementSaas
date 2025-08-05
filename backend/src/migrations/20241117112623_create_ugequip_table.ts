import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ugequip", function (table) {
    table.increments("equipement_id").primary();
    table.integer("ug_id").unsigned().notNullable();
    table.string("name").notNullable();
    table.float("equipement_prix").nullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("ug_id").references("ugdesc.ug_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_ugequip_update_date
        BEFORE UPDATE ON ugequip
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropSchemaIfExists("ugequip");
}
