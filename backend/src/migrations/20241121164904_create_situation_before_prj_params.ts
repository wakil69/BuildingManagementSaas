import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("situation_before_prj_params", function (table) {
        table.increments("situation_before_prj_id").primary()
        table.integer("company_id").unsigned().notNullable();
        table.string("name").notNullable()
        table.boolean("is_deleted").defaultTo(false);
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
    return knex.schema.dropTableIfExists("situation_before_prj_params");
}

