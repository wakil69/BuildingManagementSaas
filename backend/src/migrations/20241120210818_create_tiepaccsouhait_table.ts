import type { Knex } from "knex";


// we need to replace before_tiepp_id by tiepp_id
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tieppaccsouhait", function (table) {
        table.increments("souhait_id").primary()
        table.integer("tiepp_id").unsigned().notNullable();
        table.string("formule_wishes").notNullable();
        table.string("surface_wishes").notNullable();
        table.string("date_entree_wished", 10).nullable()
        table.timestamp("creation_date").defaultTo(knex.fn.now());
        table.integer("creation_user").unsigned().notNullable();
        table.timestamp("update_date").defaultTo(knex.fn.now());
        table.integer("update_user").unsigned().notNullable();
        
        table.foreign("creation_user").references("users.user_id");
        table.foreign("update_user").references("users.user_id");    
        table.foreign("tiepp_id").references("tiepp.tiepp_id");  
    })

    await knex.raw(`
        CREATE TRIGGER update_tieppaccsouhait_update_date
        BEFORE UPDATE ON tieppaccsouhait
        FOR EACH ROW
        SET NEW.update_date = NOW();
    `);

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("tieppaccsouhait")
}

