import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("rubconv", function (table) {
    table.increments("rub_id").primary()
    table.integer("conv_id").unsigned().notNullable();
    table.integer("version").unsigned().notNullable();
    table.integer("ug_id").unsigned().nullable();
    table.integer("equipement_id").unsigned().nullable();
    table.string("rubrique").notNullable();
    table.string("periodicity").notNullable();
    table.string("condition_payment").notNullable();
    table.float("montant");
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table
      .foreign(["conv_id", "version"])
      .references(["convdesc.conv_id", "convdesc.version"]);
    table.foreign("equipement_id").references("ugequip.equipement_id");
    table.foreign("ug_id").references("ugdesc.ug_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_rubconv_update_date
        BEFORE UPDATE ON rubconv
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rubconv");
}
