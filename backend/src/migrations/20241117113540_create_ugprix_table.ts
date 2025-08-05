import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("surface_prix_ugs", function (table) {
    table.increments("prix_id").primary();
    table.integer("batiment_id").unsigned().notNullable();
    table.float("surface").nullable();
    table
      .enum("prix_type", ["pepiniere", "centre_affaires", "coworking"])
      .notNullable();
    table.float("prix_an_1").nullable();
    table.float("prix_an_2").nullable();
    table.float("prix_an_3").nullable();
    table.float("prix_centre_affaires").nullable();
    table.float("prix_coworking").nullable();
    table.string("prix_date_debut", 10).notNullable();
    table.string("prix_date_fin", 10).nullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.integer("creation_user").unsigned().notNullable();
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned().notNullable();

    table.foreign("batiment_id").references("ugbats.batiment_id");
    table.foreign("creation_user").references("users.user_id");
    table.foreign("update_user").references("users.user_id");
  });

  await knex.raw(`
    CREATE TRIGGER update_surface_prix_ugs_update_date
    BEFORE UPDATE ON surface_prix_ugs
    FOR EACH ROW
    SET NEW.update_date = NOW();
`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("surface_prix_ugs");
}
