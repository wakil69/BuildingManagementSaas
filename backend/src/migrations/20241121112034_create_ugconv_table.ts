import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ugconv", function (table) {
    table.integer("conv_id").unsigned().notNullable();
    table.integer("version").unsigned().notNullable();
    table.integer("ug_id").unsigned().notNullable();
    table.float("surface_rent").notNullable();
    table.string("date_debut", 10).notNullable();
    table.string("date_fin", 10);
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.primary(["conv_id", "version", "ug_id"]);

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table
      .foreign(["conv_id", "version"])
      .references(["convdesc.conv_id", "convdesc.version"]);
    table.foreign("ug_id").references("ugdesc.ug_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_ugconv_update_date
        BEFORE UPDATE ON ugconv
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("ugconv");
}
