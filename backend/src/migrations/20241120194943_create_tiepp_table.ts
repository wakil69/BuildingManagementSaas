import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tiepp", function (table) {
    table.increments("tiepp_id").primary();
    table.integer("company_id").unsigned().notNullable();
    table.integer("batiment_id").unsigned().notNullable();
    table.enum("civilite", ["Mr", "Mme"]).nullable();
    table.string("surname").notNullable();
    table.string("first_name").notNullable();
    table.enum("sex", ["M", "F"]).nullable();
    table.string("birth_name").nullable();
    table.string("birth_date", 10).nullable();
    table.string("nationality").nullable();
    table.string("phone_fixed_number").nullable();
    table.string("phone_number").nullable();
    table.string("email").notNullable();
    table.string("death_date", 10).nullable();
    table.enum("image_authorisation", ["Oui", "Non"]).nullable();
    table.string("num_voie").nullable();
    table.string("typ_voie").nullable();
    table.string("int_voie").nullable();
    table.string("complement_voie").nullable();
    table.string("code_postal").nullable();
    table.string("commune").nullable();
    table.string("cedex").nullable();
    table.string("pays").nullable();
    table.enum("qpv", ["Oui", "Non"]).nullable();
    table.enum("zfu", ["Oui", "Non"]).nullable();
    table.string("first_meeting_date", 10).nullable();
    table.string("first_meeting_hour_begin").nullable();
    table.string("first_meeting_hour_end").nullable();
    table.string("prescriber_id").nullable();
    table.text("first_meeting_feedback").nullable();
    table.string("situation_socio_pro_id").nullable();
    table.string("study_level_id").nullable();
    table.string("situation_before_prj_id").nullable();
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
    CREATE TRIGGER update_tiepp_update_date
    BEFORE UPDATE ON tiepp
    FOR EACH ROW
    SET NEW.update_date = NOW();
`);

}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tiepp")
}
