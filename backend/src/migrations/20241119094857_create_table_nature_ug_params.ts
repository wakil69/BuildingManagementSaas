import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("nature_ug_params", function (table) {
        table.increments("nature_ug_id").primary()
        table.integer("company_id").unsigned().notNullable();
        table.string("name").notNullable()
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();    

        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
          });
          
        table.foreign("creation_user").references("users.user_id");
        table.foreign("company_id").references("companies.company_id");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("nature_ug_params");
}

