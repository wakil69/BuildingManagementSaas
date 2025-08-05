export const tiersSchema = {
  Suivi: {
    type: "array",
    items: {
      type: "object",
      properties: {
        suivi_id: {
          type: "integer",
          description: "The ID of the suivi.",
        },
        date_acc_suivi: {
          type: "string",
          format: "date",
          description: "The date of the suivi.",
        },
        typ_accompagnement_id: {
          type: "integer",
          description: "The type of suivi ID.",
        },
        hour_begin: {
          type: "string",
          format: "time",
          description: "The start time of the suivi.",
        },
        hour_end: {
          type: "string",
          format: "time",
          description: "The end time of the suivi.",
        },
        sujet_accompagnement_id: {
          type: "integer",
          description: "The subject ID of the suivi.",
        },
        feedback: {
          type: "string",
          nullable: true,
          description: "Feedback for the suivi.",
        },
        files: {
          type: "array",
          description: "Array of file objects associated with the suivi.",
          items: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "The name of the file.",
              },
              url: {
                type: "string",
                format: "uri",
                description: "The signed URL for accessing the file.",
              },
            },
          },
        },
      },
    },
  },
  ProjetPostBody: {
    type: "object",
    properties: {
      prj_id: { type: "number" },
      raison_social_prj: { type: "string", nullable: true },
      activite_prj: { type: "string" },
      date_debut_prj: { type: "string", nullable: true },
      nb_dirigeants_prj: { type: "number", nullable: true },
      effectif_prj: { type: "number", nullable: true },
      legal_form_id: { type: "number", nullable: true },
    },
  },
  ProjetUpdateBody: {
    type: "object",
    properties: {
      prj_id: { type: "number" },
      raison_social_prj: { type: "string", nullable: true },
      activite_prj: { type: "string" },
      date_debut_prj: { type: "string", nullable: true },
      nb_dirigeants_prj: { type: "number", nullable: true },
      effectif_prj: { type: "number", nullable: true },
      legal_form_id: { type: "number", nullable: true },
    },
  },
  PPResponse: {
    type: "object",
    properties: {
      infosPP: {
        type: "object",
        properties: {
          batiment_id: { type: "number" },
          civilite: { type: "string", nullable: true },
          surname: { type: "string" },
          first_name: { type: "string" },
          birth_date: { type: "string", nullable: true },
          birth_name: { type: "string", nullable: true },
          email: { type: "string" },
          phone_number: { type: "string", nullable: true },
          num_voie: { type: "string", nullable: true },
          int_voie: { type: "string", nullable: true },
          typ_voie: { type: "string", nullable: true },
          complement_voie: { type: "string", nullable: true },
          code_postal: { type: "string", nullable: true },
          commune: { type: "string", nullable: true },
          cedex: { type: "string", nullable: true },
          pays: { type: "string", nullable: true },
          qpv: { type: "string", nullable: true },
          zfu: { type: "string", nullable: true },
          study_level_id: { type: "number", nullable: true },
          situation_before_prj_id: { type: "number", nullable: true },
          situation_socio_pro_id: { type: "string", nullable: true },
          image_authorisation: { type: "string", nullable: true },
        },
      },
      projets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            prj_id: { type: "number" },
            raison_social_prj: { type: "string", nullable: true },
            activite_prj: { type: "string" },
            date_debut_prj: { type: "string", nullable: true },
            nb_dirigeants_prj: { type: "number", nullable: true },
            effectif_prj: { type: "number", nullable: true },
            legal_form_id: { type: "number", nullable: true },
          },
        },
      },
      accompagnementSouhait: {
        type: "object",
        properties: {
          souhait_id: { type: "number" },
          formule_wishes: { type: "string" },
          surface_wishes: { type: "string" },
          date_entree_wished: { type: "string", nullable: true },
        },
      },
      formulesPP: {
        type: "array",
        items: {
          type: "object",
          properties: {
            form_pp_id: { type: "number" },
            formule_id: { type: "number" },
            date_debut_formule: { type: "string" },
            date_fin_formule: { type: "string", nullable: true },
          },
        },
      },
      firstMeeting: {
        type: "object",
        properties: {
          first_meeting_date: { type: "string", nullable: true },
          first_meeting_hour_begin: { type: "string", nullable: true },
          first_meeting_hour_end: { type: "string", nullable: true },
          prescriber_id: { type: "number", nullable: true },
          first_meeting_feedback: { type: "string", nullable: true },
        },
      },
      companies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rel_id: { type: "number" },
            tiepm_id: { type: "number" },
            raison_social: { type: "string", nullable: true },
            rel_typ_id: { type: "string", nullable: true },
            relation_date_debut: { type: "string", nullable: true },
            relation_date_fin: { type: "number", nullable: true },
            relation_status: { type: "string", nullable: true },
          },
        },
      },
    },
  },
  PMResponse: {
    type: "object",
    properties: {
      infosPM: {
        type: "object",
        properties: {
          batiment_id: { type: "number" },
          raison_sociale: { type: "string" },
          sigle: { type: "string", nullable: true },
          legal_form_id: { type: "number", nullable: true },
          activite: { type: "string", nullable: true },
          date_creation_company: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          phone_number: { type: "string", nullable: true },
          num_voie: { type: "string", nullable: true },
          int_voie: { type: "string", nullable: true },
          typ_voie: { type: "string", nullable: true },
          complement_voie: { type: "string", nullable: true },
          code_postal: { type: "string", nullable: true },
          commune: { type: "string", nullable: true },
          cedex: { type: "string", nullable: true },
          pays: { type: "string", nullable: true },
          qpv: { type: "string", nullable: true },
          zfu: { type: "string", nullable: true },
          siret: { type: "string", nullable: true },
          code_ape: { type: "string", nullable: true },
          capital_amount: { type: "number", nullable: true },
          date_end_exercise: { type: "number", nullable: true },
        },
      },
      dirigeants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rel_id: { type: "number" },
            tiepp_id: { type: "number" },
            libelle: { type: "string", nullable: true },
            rel_typ_id: { type: "string", nullable: true },
            relation_date_debut: { type: "string", nullable: true },
            relation_date_fin: { type: "number", nullable: true },
            relation_status: { type: "string", nullable: true },
          },
        },
      },
      effectifs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            year: { type: "number" },
            nb_cdi: { type: "number", nullable: true },
            nb_cdd: { type: "number", nullable: true },
            nb_int: { type: "number", nullable: true },
            nb_caid: { type: "number", nullable: true },
            nb_alt: { type: "number", nullable: true },
            nb_stg: { type: "number", nullable: true },
          },
        },
      },
      formulesPM: {
        type: "array",
        items: {
          type: "object",
          properties: {
            form_pm_id: { type: "number" },
            formule_id: { type: "number" },
            date_debut_formule: { type: "string" },
            date_fin_formule: { type: "string", nullable: true },
          },
        },
      },
      cas: {
        type: "object",
        properties: {
          year: { type: "number", nullable: true },
          ca: { type: "number", nullable: true },
        },
      },
      sortiePep: {
        type: "object",
        properties: {
          date_sortie: { type: "string", nullable: true },
          motif_id: { type: "number", nullable: true },
          new_implantation: { type: "string", nullable: true },
        },
      },
      postPep: {
        type: "object",
        properties: {
          actualisation_date: { type: "string", nullable: true },
          statut_id: { type: "string", nullable: true },
        },
      },
    },
  },
  TiersPPInfosGenBody: {
    type: "object",
    properties: {
      batiment_id: { type: "number" },
      civilite: { type: "string" },
      surname: { type: "string" },
      first_name: { type: "string" },
      birth_date: { type: "string", nullable: true },
      birth_name: { type: "string", nullable: true },
      email: { type: "string" },
      phone_number: { type: "string", nullable: true },
      num_voie: { type: "string", nullable: true },
      typ_voie: { type: "string", nullable: true },
      complement_voie: { type: "string", nullable: true },
      code_postal: { type: "string", nullable: true },
      commune: { type: "string", nullable: true },
      cedex: { type: "string", nullable: true },
      pays: { type: "string", nullable: true },
      qpv: { type: "string", nullable: true },
      zfu: { type: "string", nullable: true },
      study_level_id: { type: "number" },
      situation_before_prj_id: { type: "number" },
      situation_socio_pro_id: { type: "string" },
      image_authorisation: { type: "string", nullable: true },
    },
  },
  TiersPMInfosGenBody: {
    type: "object",
    properties: {
      batiment_id: { type: "number" },
      raison_sociale: { type: "string" },
      sigle: { type: "string", nullable: true },
      legal_form_id: { type: "number", nullable: true },
      activite: { type: "string", nullable: true },
      date_creation_company: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      phone_number: { type: "string", nullable: true },
      num_voie: { type: "string", nullable: true },
      typ_voie: { type: "string", nullable: true },
      complement_voie: { type: "string", nullable: true },
      code_postal: { type: "string", nullable: true },
      commune: { type: "string", nullable: true },
      cedex: { type: "string", nullable: true },
      pays: { type: "string", nullable: true },
      qpv: { type: "string", nullable: true },
      zfu: { type: "string", nullable: true },
      siret: { type: "string", nullable: true },
      code_ape: { type: "string", nullable: true },
      date_end_exercise: { type: "number", nullable: true },
    },
  },
  TiersSearchResponse: {
    type: "object",
    properties: {
      global: {
        type: "array",
        items: {
          $ref: "#/components/schemas/TiersSearch",
        },
      },
      cursor: {
        type: "object",
        properties: {
          next: {
            type: "number",
            nullable: true,
            description: "Offset for the next page, if available",
          },
          prev: {
            type: "number",
            nullable: true,
            description: "Offset for the previous page, if available",
          },
        },
        nullable: true,
        description: "Pagination cursor with next and prev offsets",
      },
      totalCount: {
        type: "number",
        description: "Total number of tiers matching the query",
      },
    },
  },
  TiersSearch: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "ID tiers",
      },
      libelle: {
        type: "string",
        description: "Libelle tiers",
      },
      qualite: {
        type: "string",
        description: "Quality tiers (PM or PP)",
      },
      email: {
        type: "string",
        description: "Email tiers",
      },
      phone_number: {
        type: "string",
        description: "Phone number tiers",
      },
    },
  },
  TiersFilesResponse: {
    type: "array",
    items: {
      type: "object",
      properties: {
        url: {
          type: "string",
        },
        filename: {
          type: "string",
        },
      },
    },
  },
  TiersCreationPPBody: {
    type: "object",
    properties: {
      batiment_id: {
        type: "integer",
      },
      civilite: {
        type: "string",
        enum: ["Mr", "Mme", "", null],
        nullable: true,
      },
      surname: {
        type: "string",
      },
      first_name: {
        type: "string",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
      },
      birth_name: {
        type: "string",
        nullable: true,
      },
      email: {
        type: "string",
        format: "email",
      },
      phone_number: {
        type: "string",
        nullable: true,
      },
      num_voie: {
        type: "string",
        nullable: true,
      },
      int_voie: {
        type: "string",
        nullable: true,
      },
      typ_voie: {
        type: "string",
        nullable: true,
      },
      complement_voie: {
        type: "string",
        nullable: true,
      },
      code_postal: {
        type: "string",
        nullable: true,
      },
      commune: {
        type: "string",
        nullable: true,
      },
      cedex: {
        type: "string",
        nullable: true,
      },
      pays: {
        type: "string",
        nullable: true,
      },
      qpv: {
        type: "string",
        enum: ["Oui", "Non", "", null],
        nullable: true,
      },
      zfu: {
        type: "string",
        enum: ["Oui", "Non", "", null],
        nullable: true,
      },
      study_level_id: {
        type: "integer",
        nullable: true,
      },
      situation_before_prj_id: {
        type: "integer",
        nullable: true,
      },
      situation_socio_pro_id: {
        type: "string",
        nullable: true,
      },
      image_authorisation: {
        type: "string",
        enum: ["Oui", "Non", "", null],
        nullable: true,
      },
      activite_prj: {
        type: "string",
      },
      raison_social_prj: {
        type: "string",
        nullable: true,
      },
      date_debut_prj: {
        type: "string",
        format: "date",
        nullable: true,
      },
      nb_dirigeants_prj: {
        type: "integer",
        nullable: true,
      },
      effectif_prj: {
        type: "integer",
        nullable: true,
      },
      legal_form_id: {
        type: "integer",
        nullable: true,
      },
      first_meeting_date: {
        type: "string",
        format: "date",
        nullable: true,
      },
      first_meeting_hour_begin: {
        type: "string",
        format: "time",
        nullable: true,
      },
      first_meeting_hour_end: {
        type: "string",
        format: "time",
        nullable: true,
      },
      prescriber_id: {
        type: "integer",
        nullable: true,
      },
      first_meeting_feedback: {
        type: "string",
        nullable: true,
      },
      formule_wishes: {
        type: "string",
      },
      surface_wishes: {
        type: "string",
      },
      date_entree_wished: {
        type: "string",
        format: "date",
        nullable: true,
      },
      formule_id: {
        type: "integer",
      },
      date_debut_formule: {
        type: "string",
        format: "date",
      },
      date_fin_formule: {
        type: "string",
        format: "date",
        nullable: true,
      },
    },
    required: [
      "batiment_id",
      "surname",
      "first_name",
      "email",
      "activite_prj",
      "formule_wishes",
      "surface_wishes",
      "formule_id",
      "date_debut_formule",
    ],
  },
  TiersCreationPMBody: {
    type: "object",
    properties: {
      batiment_id: {
        type: "integer",
      },
      raison_sociale: {
        type: "string",
      },
      sigle: {
        type: "string",
        nullable: true,
      },
      legal_form_id: {
        type: "integer",
        nullable: true,
      },
      activite: {
        type: "string",
        nullable: true,
      },
      date_creation_company: {
        type: "string",
        format: "date",
        nullable: true,
      },
      email: {
        type: "string",
        format: "email",
        nullable: true,
      },
      phone_number: {
        type: "string",
        nullable: true,
      },
      num_voie: {
        type: "string",
        nullable: true,
      },
      int_voie: {
        type: "string",
        nullable: true,
      },
      typ_voie: {
        type: "string",
        nullable: true,
      },
      complement_voie: {
        type: "string",
        nullable: true,
      },
      code_postal: {
        type: "string",
        nullable: true,
      },
      commune: {
        type: "string",
        nullable: true,
      },
      cedex: {
        type: "string",
        nullable: true,
      },
      pays: {
        type: "string",
        nullable: true,
      },
      qpv: {
        type: "string",
        enum: ["Oui", "Non", "", null],
        nullable: true,
      },
      zfu: {
        type: "string",
        enum: ["Oui", "Non", "", null],
        nullable: true,
      },
      siret: {
        type: "string",
        nullable: true,
      },
      code_ape: {
        type: "string",
        nullable: true,
      },
      capital_amount: {
        type: "number",
        format: "float",
        nullable: true,
      },
      date_end_exercise: {
        type: "string",
        format: "date",
        nullable: true,
      },
      formule_id: {
        type: "integer",
      },
      date_debut_formule: {
        type: "string",
        format: "date",
      },
      date_fin_formule: {
        type: "string",
        format: "date",
        nullable: true,
      },
      relations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tiepp_id: {
              type: "integer",
            },
            rel_typ_id: {
              type: "integer",
              nullable: true,
            },
            relation_date_debut: {
              type: "string",
              format: "date",
              nullable: true,
            },
            relation_date_fin: {
              type: "string",
              format: "date",
              nullable: true,
            },
            libelle: {
              type: "string",
            },
          },
          required: ["tiepp_id", "libelle"],
        },
      },
    },
    required: [
      "batiment_id",
      "raison_sociale",
      "formule_id",
      "date_debut_formule",
      "relations",
    ],
  },
  TiersCreationPPPMBody: {
    type: "object",
    properties: {
      pm: {
        type: "object",
        properties: {
          batiment_id: { type: "integer" },
          raison_sociale: { type: "string" },
          sigle: { type: "string", nullable: true },
          legal_form_id: { type: "integer", nullable: true },
          activite: { type: "string", nullable: true },
          date_creation_company: {
            type: "string",
            format: "date",
            nullable: true,
          },
          email: { type: "string", format: "email", nullable: true },
          phone_number: { type: "string", nullable: true },
          num_voie: { type: "string", nullable: true },
          int_voie: { type: "string", nullable: true },
          typ_voie: { type: "string", nullable: true },
          complement_voie: { type: "string", nullable: true },
          code_postal: { type: "string", nullable: true },
          commune: { type: "string", nullable: true },
          cedex: { type: "string", nullable: true },
          pays: { type: "string", nullable: true },
          qpv: { type: "string", enum: ["Oui", "Non", ""], nullable: true },
          zfu: { type: "string", enum: ["Oui", "Non", ""], nullable: true },
          siret: { type: "string", nullable: true },
          code_ape: { type: "string", nullable: true },
          capital_amount: { type: "number", format: "float", nullable: true },
          date_end_exercise: { type: "string", format: "date", nullable: true },
          formule_id: { type: "integer" },
          date_debut_formule: { type: "string", format: "date" },
          date_fin_formule: { type: "string", format: "date", nullable: true },
          rel_typ_id: { type: "integer", nullable: true },
          relation_date_debut: {
            type: "string",
            format: "date",
            nullable: true,
          },
          relation_date_fin: { type: "string", format: "date", nullable: true },
        },
        required: [
          "batiment_id",
          "raison_sociale",
          "formule_id",
          "date_debut_formule",
        ],
      },
      pp: {
        type: "object",
        properties: {
          batiment_id: { type: "integer" },
          civilite: { type: "string", enum: ["Mr", "Mme", ""], nullable: true },
          surname: { type: "string" },
          first_name: { type: "string" },
          birth_date: { type: "string", format: "date", nullable: true },
          birth_name: { type: "string", nullable: true },
          email: { type: "string", format: "email" },
          phone_number: { type: "string", nullable: true },
          num_voie: { type: "string", nullable: true },
          int_voie: { type: "string", nullable: true },
          typ_voie: { type: "string", nullable: true },
          complement_voie: { type: "string", nullable: true },
          code_postal: { type: "string", nullable: true },
          commune: { type: "string", nullable: true },
          cedex: { type: "string", nullable: true },
          pays: { type: "string", nullable: true },
          qpv: { type: "string", enum: ["Oui", "Non", ""], nullable: true },
          zfu: { type: "string", enum: ["Oui", "Non", ""], nullable: true },
          study_level_id: { type: "integer", nullable: true },
          situation_before_prj_id: { type: "integer", nullable: true },
          situation_socio_pro_id: { type: "string", nullable: true },
          image_authorisation: {
            type: "string",
            enum: ["Oui", "Non", ""],
            nullable: true,
          },
          activite_prj: { type: "string" },
          raison_social_prj: { type: "string", nullable: true },
          date_debut_prj: { type: "string", format: "date", nullable: true },
          nb_dirigeants_prj: { type: "integer", nullable: true },
          effectif_prj: { type: "integer", nullable: true },
          legal_form_id: { type: "integer", nullable: true },
          first_meeting_date: {
            type: "string",
            format: "date",
            nullable: true,
          },
          first_meeting_hour_begin: { type: "string", nullable: true },
          first_meeting_hour_end: { type: "string", nullable: true },
          prescriber_id: { type: "integer", nullable: true },
          first_meeting_feedback: { type: "string", nullable: true },
          formule_wishes: { type: "string" },
          surface_wishes: { type: "string" },
          date_entree_wished: {
            type: "string",
            format: "date",
            nullable: true,
          },
          formule_id: { type: "integer" },
          date_debut_formule: { type: "string", format: "date" },
          date_fin_formule: { type: "string", format: "date", nullable: true },
        },
        required: [
          "batiment_id",
          "surname",
          "first_name",
          "email",
          "activite_prj",
          "formule_wishes",
          "surface_wishes",
          "formule_id",
          "date_debut_formule",
        ],
      },
    },
    required: ["pm", "pp"],
  },
  TiersCreationResponse: {
    type: "object",
    properties: {
      id: {
        type: "number",
      },
      message: {
        type: "string",
      },
    },
  },
};
