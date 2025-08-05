import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("ugdesc", function (table) {
      table.integer("nature_ug_id").unsigned().notNullable();

      table.foreign("nature_ug_id").references("nature_ug_params.nature_ug_id");
    })
    .alterTable("ugequip", function (table) {
      table.integer("nature_equipement_id").unsigned().notNullable();

      table
        .foreign("nature_equipement_id")
        .references("nature_equipements_params.nature_equipement_id");
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("ugdesc", function (table) {
      table.dropColumn("nature_ug_id");
    })
    .alterTable("ugequip", function (table) {
      table.dropColumn("nature_equipement_id");
    });
}
