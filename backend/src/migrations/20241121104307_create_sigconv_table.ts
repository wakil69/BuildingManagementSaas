import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("sigconv", function (table) {
    table.integer("conv_id").unsigned().notNullable();
    table.integer("version").unsigned().notNullable();
    table.integer("tiepp_id").unsigned().notNullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.primary(["conv_id", "version", "tiepp_id"]);

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table
      .foreign(["conv_id", "version"])
      .references(["convdesc.conv_id", "convdesc.version"]);
    table.foreign("tiepp_id").references("tiepp.tiepp_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_sigconv_update_date
        BEFORE UPDATE ON sigconv
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("sigconv");
}
