import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("ugdesc", function (table) {
    table.increments("ug_id").primary();
    table.integer("company_id").unsigned().notNullable();
    table.integer("batiment_id").unsigned().notNullable();
    table.integer("etage_id").unsigned().notNullable();
    table.string("name").notNullable();
    table.string("date_construction", 10).nullable();
    table.string("date_entree", 10).nullable();
    table.string("num_voie").nullable();
    table.string("typ_voie").nullable();
    table.string("int_voie").notNullable();
    table.string("complement_voie").nullable();
    table.string("code_postal").notNullable();
    table.string("commune").notNullable();
    table.string("cedex").nullable();
    table.string("pays").notNullable();
    table.float("surface").nullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("company_id").references("companies.company_id");
    table.foreign("batiment_id").references("ugbats.batiment_id");
    table.foreign("etage_id").references("ugetages.etage_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_ugbats_update_date
        BEFORE UPDATE ON ugbats
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);

  await knex.raw(`
        CREATE TRIGGER update_ugetages_update_date
        BEFORE UPDATE ON ugetages
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);

  await knex.raw(`
        CREATE TRIGGER update_ugdesc_update_date
        BEFORE UPDATE ON ugdesc
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TRIGGER IF EXISTS update_ugdesc_update_date;`);
  await knex.raw(`DROP TRIGGER IF EXISTS update_ugbats_update_date;`);
  await knex.raw(`DROP TRIGGER IF EXISTS update_ugetages_update_date;`);
  await knex.schema.dropTableIfExists("ugdesc");
}
