import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("secteurs_activites_params", function (table) {
        table.increments("secteur_activite_id").primary()
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

    await knex.schema.alterTable("tiepm", function(table) {
        table.integer("secteur_activite_id").unsigned().nullable();
        table.foreign("secteur_activite_id")
             .references("secteurs_activites_params.secteur_activite_id");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("secteurs_activites_params");
}

