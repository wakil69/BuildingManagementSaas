import type { Knex } from "knex";

const TABLES = [
    "study_level_params",
    "nature_equipements_params",
    "nature_ug_params",
    "situation_before_prj_params",
    "legal_forms_params",
    "formules_params",
    "relations_pm_pp_params",
    "motifs_sortie_pep_params",
    "statuts_post_pep_params",
    "prescribers_params",
    "type_accompagnements_params"
];

export async function up(knex: Knex): Promise<void> {
    for (const tableName of TABLES) {
        await knex.schema.alterTable(tableName, table => {
            table.unique(["name", "company_id"], {
                indexName: "unique_name_company",
            });
        });
    }

}

export async function down(knex: Knex): Promise<void> {

    for (const tableName of TABLES) {
        await knex.schema.alterTable(tableName, table => {
            table.dropUnique(["name", "company_id"], "unique_name_company");
        });
    }
}