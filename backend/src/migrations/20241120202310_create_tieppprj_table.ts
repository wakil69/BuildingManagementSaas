import type { Knex } from "knex";


// we need to replace before_tiepp_id by tiepp_id
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tieppprj", function (table) {
        table.increments("prj_id").primary()
        table.integer("tiepp_id").unsigned().notNullable();
        table.string("raison_social_prj");
        table.string("activite_prj").notNullable();
        table.string("date_debut_prj", 10)
        table.integer("nb_dirigeants_prj")
        table.integer("effectif_prj")
        table.string("legal_form_id")
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();
        table.timestamp("update_date").defaultTo(knex.fn.now());
        table.integer("update_user").unsigned().notNullable();
        
        table.foreign("creation_user").references("users.user_id");
        table.foreign("update_user").references("users.user_id");    
        table.foreign("tiepp_id").references("tiepp.tiepp_id");  
    })

    await knex.raw(`
        CREATE TRIGGER update_tieppprj_update_date
        BEFORE UPDATE ON tieppprj
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("tieppprj")
}

