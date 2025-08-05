import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("convdesc", function (table) {
    table.integer("conv_id").unsigned().notNullable();
    table.integer("version").unsigned().notNullable();
    table.integer("company_id").unsigned().notNullable();
    table.integer("batiment_id").unsigned().notNullable();
    table.enum("typ_conv", ["PEPINIERE", "COWORKING"]).notNullable();
    table.integer("tiepm_id").unsigned().notNullable();
    table.string("raison_sociale").notNullable()
    table.string("legal_form_id").notNullable()
    table.string("date_signature", 10).notNullable();
    table.string("date_debut", 10).notNullable();
    table.string("date_fin", 10);
    table.string("statut").notNullable()
    table.integer("conv_age").notNullable()
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.primary(["conv_id", "version"]);

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("company_id").references("companies.company_id");
    table.foreign("batiment_id").references("ugbats.batiment_id");
    table.foreign("tiepm_id").references("tiepm.tiepm_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_convdesc_update_date
        BEFORE UPDATE ON convdesc
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("convdesc");
}
