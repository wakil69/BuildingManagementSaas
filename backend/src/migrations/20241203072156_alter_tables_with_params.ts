import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("convdesc", function (table) {
        table.integer("legal_form_id").unsigned().notNullable().alter()

        table.foreign("legal_form_id").references("legal_forms_params.legal_form_id")
    })

    await knex.schema.alterTable("tieformpm", function (table) {
        table.integer("formule_id").unsigned().notNullable().alter()

        table.foreign("formule_id").references("formules_params.formule_id")
    })

    await knex.schema.alterTable("tieformpp", function (table) {
        table.integer("formule_id").unsigned().notNullable().alter()

        table.foreign("formule_id").references("formules_params.formule_id")
    })

    await knex.schema.alterTable("tiepm", function (table) {
        table.integer("legal_form_id").unsigned().nullable().alter()

        table.foreign("legal_form_id").references("legal_forms_params.legal_form_id")
    })

    await knex.schema.alterTable("tiepmpostpep", function (table) {
        table.integer("statut_id").unsigned().notNullable().alter()

        table.foreign("statut_id").references("statuts_post_pep_params.statut_id")
    })

    await knex.schema.alterTable("tiepmsortie", function (table) {
        table.integer("motif_id").unsigned().notNullable().alter()

        table.foreign("motif_id").references("motifs_sortie_pep_params.motif_id")
    })

    await knex.schema.alterTable("tiepp", function (table) {
        table.integer("prescriber_id").unsigned().nullable().alter()
        table.integer("study_level_id").unsigned().nullable().alter()
        table.integer("situation_before_prj_id").unsigned().nullable().alter()

        table.foreign("prescriber_id").references("prescribers_params.prescriber_id")
        table.foreign("study_level_id").references("study_level_params.study_level_id")
        table.foreign("situation_before_prj_id").references("situation_before_prj_params.situation_before_prj_id")
    })

    await knex.schema.alterTable("tieppaccsuivi", function (table) {
        table.integer("typ_accompagnement_id").unsigned().notNullable().alter()
        table.integer("sujet_accompagnement_id").unsigned().notNullable().alter()

        table.foreign("typ_accompagnement_id").references("type_accompagnements_params.typ_accompagnement_id")
        table.foreign("sujet_accompagnement_id").references("sujets_accompagnements_params.sujet_accompagnement_id")
    })

    await knex.schema.alterTable("tieppprj", function (table) {
        table.integer("legal_form_id").unsigned().nullable().alter()

        table.foreign("legal_form_id").references("legal_forms_params.legal_form_id")
    })

    await knex.schema.alterTable("tierel", function (table) {
        table.integer("rel_typ_id").unsigned().nullable().alter()

        table.foreign("rel_typ_id").references("relations_pm_pp_params.rel_typ_id")
    })


}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("convdesc", function (table) {
        table.dropForeign(["legal_form_id"]);
        table.integer("legal_form_id").nullable().alter();
    });

    await knex.schema.alterTable("tieformpm", function (table) {
        table.dropForeign(["formule_id"]);
        table.integer("formule_id").nullable().alter();
    });

    await knex.schema.alterTable("tieformpp", function (table) {
        table.dropForeign(["formule_id"]);
        table.integer("formule_id").nullable().alter();
    });

    await knex.schema.alterTable("tiepm", function (table) {
        table.dropForeign(["legal_form_id"]);
        table.integer("legal_form_id").nullable().alter();
    });

    await knex.schema.alterTable("tiepmpostpep", function (table) {
        table.dropForeign(["statut_id"]);
        table.integer("statut_id").nullable().alter();
    });

    await knex.schema.alterTable("tiepmsortie", function (table) {
        table.dropForeign(["motif_id"]);
        table.integer("motif_id").nullable().alter();
    });

    await knex.schema.alterTable("tiepp", function (table) {
        table.dropForeign(["prescriber_id"]);
        table.dropForeign(["study_level_id"]);
        table.dropForeign(["situation_before_prj_id"]);
        table.integer("prescriber_id").nullable().alter();
        table.integer("study_level_id").nullable().alter();
        table.integer("situation_before_prj_id").nullable().alter();
    });

    await knex.schema.alterTable("tieppaccsuivi", function (table) {
        table.dropForeign(["typ_accompagnement_id"]);
        table.dropForeign(["sujet_accompagnement_id"]);
        table.integer("typ_accompagnement_id").nullable().alter();
        table.integer("sujet_accompagnement_id").nullable().alter();
    });

    await knex.schema.alterTable("tieppprj", function (table) {
        table.dropForeign(["legal_form_id"]);
        table.integer("legal_form_id").nullable().alter();
    });

    await knex.schema.alterTable("tierel", function (table) {
        table.dropForeign(["rel_typ_id"]);
        table.integer("rel_typ_id").nullable().alter();
    });
}

