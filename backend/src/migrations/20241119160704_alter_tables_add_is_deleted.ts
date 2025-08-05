import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("nature_equipements_params", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("nature_ug_params", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("ugequip", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("users", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("ugetages", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("ugdesc", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    })
    .alterTable("companies", function (table) {
      table.boolean("is_deleted").defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("nature_equipements_params", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("nature_ug_params", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("ugequip", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("users", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("ugetages", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("ugdesc", function (table) {
      table.dropColumn("is_deleted");
    })
    .alterTable("companies", function (table) {
      table.dropColumn("is_deleted");
    });
}
