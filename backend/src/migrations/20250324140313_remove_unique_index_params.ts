import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("study_level_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("nature_equipements_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("nature_ug_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("situation_before_prj_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("legal_forms_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("formules_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("relations_pm_pp_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("motifs_sortie_pep_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("statuts_post_pep_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("prescribers_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });

    await knex.schema.alterTable("type_accompagnements_params", table => {
        table.dropUnique(["name", "company_id"], "unique_name_company");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("study_level_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("nature_equipements_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("nature_ug_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("legal_forms_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("formules_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("relations_pm_pp_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });


    await knex.schema.alterTable("motifs_sortie_pep_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("statuts_post_pep_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("prescribers_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });

    await knex.schema.alterTable("type_accompagnements_params", table => {
        table.unique(["name", "company_id"], {
            indexName: "unique_name_company",
        });
    });
}

