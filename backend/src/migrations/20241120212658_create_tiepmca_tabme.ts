import type { Knex } from "knex";


// we need to replace before_tiepp_id by tiepp_id
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tiepmca", function (table) {
        table.increments("ca_id").primary()
        table.integer("tiepm_id").unsigned().notNullable();
        table.integer("year").notNullable()
        table.double("ca").notNullable()
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();
        table.timestamp("update_date").defaultTo(knex.fn.now());
        table.integer("update_user").unsigned().notNullable();
        
        table.unique(["tiepm_id", "year"], {
            indexName: "unique_tiepm_id_year",
          });
          
        table.foreign("creation_user").references("users.user_id");
        table.foreign("update_user").references("users.user_id");    
        table.foreign("tiepm_id").references("tiepm.tiepm_id");  
    })

    await knex.raw(`
        CREATE TRIGGER update_tiepmca_update_date
        BEFORE UPDATE ON tiepmca
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("tiepmca")
}

