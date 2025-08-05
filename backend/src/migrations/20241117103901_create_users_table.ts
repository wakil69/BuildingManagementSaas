import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", function (table) {
    table.increments("user_id").primary();
    table.integer("company_id").unsigned().notNullable();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.enum("role", ["admin", "user"]).notNullable();
    table.timestamp("creation_date").defaultTo(knex.fn.now());
    table.timestamp("update_date").defaultTo(knex.fn.now());
    table.integer("update_user").unsigned();
    table.integer("creation_user").unsigned();

    table.foreign("company_id").references("companies.company_id");
  });

  await knex.raw(`
        CREATE TRIGGER update_users_update_date
        BEFORE UPDATE ON users
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP TRIGGER IF EXISTS update_users_update_date;
    `);

  await knex.schema.dropTableIfExists("users");
}
