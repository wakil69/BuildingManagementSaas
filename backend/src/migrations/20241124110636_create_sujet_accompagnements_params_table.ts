import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("sujets_accompagnements_params", function (table) {
        table.increments("sujet_accompagnement_id").primary()
        table.integer("typ_accompagnement_id").unsigned().notNullable()
        table.integer("company_id").unsigned().notNullable();
        table.string("name").notNullable()
        table.boolean("is_deleted").defaultTo(false);
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();    

        table.unique(["name", "company_id", "typ_accompagnement_id"], {
            indexName: "unique_name_company_accompagnement",
          });
        
        table.foreign("typ_accompagnement_id").references("type_accompagnements_params.typ_accompagnement_id");
        table.foreign("creation_user").references("users.user_id");
        table.foreign("company_id").references("companies.company_id");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("type_accompagnements_params");
}

