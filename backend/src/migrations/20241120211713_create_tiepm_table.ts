import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tiepm", function (table) {
    table.increments("tiepm_id").primary();
    table.integer("company_id").unsigned().notNullable();
    table.integer("batiment_id").unsigned().notNullable();
    table.string("raison_sociale").notNullable();
    table.string("sigle");
    table.string("date_creation_company", 10);
    table.string("activite");
    table.string("legal_form_id");
    table.string("siret");
    table.string("code_ape");
    table.string("date_end_exercise", 10);
    table.string("tva");
    table.float("capital_amount");
    table.string("phone_fixed_number");
    table.string("phone_number");
    table.string("email");
    table.string("num_voie");
    table.string("typ_voie");
    table.string("int_voie");
    table.string("complement_voie");
    table.string("code_postal");
    table.string("commune");
    table.string("cedex");
    table.string("pays");
    table.enum("qpv", ["Oui", "Non"]);
    table.enum("zfu", ["Oui", "Non"]);
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
    table.foreign("company_id").references("companies.company_id");
    table.foreign("batiment_id").references("ugbats.batiment_id");
  });

  await knex.raw(`
    CREATE TRIGGER update_tiepm_update_date
    BEFORE UPDATE ON tiepm
    FOR EACH ROW
    SET NEW.update_date = NOW();
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tiepm");
}
