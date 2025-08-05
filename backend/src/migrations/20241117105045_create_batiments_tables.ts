import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("ugbats", function (table) {
        table.increments("batiment_id").primary()
        table.integer("company_id").unsigned().notNullable()
        table.string("name").notNullable()
        table.boolean("is_deleted").notNullable()
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();
        table.timestamp("update_date").defaultTo(knex.fn.now());
        table.integer("update_user").unsigned().notNullable();

        table.unique(["name", "company_id"], {
            indexName: "unique_name_company"
        });
        
        table.foreign("creation_user").references("users.user_id")
        table.foreign("update_user").references("users.user_id")
        table.foreign("company_id").references("companies.company_id")
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("UGBATS")
}

