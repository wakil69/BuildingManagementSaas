export const conventionSchema = {
  ConventionsFilesResponse: {
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
  ConventionSearchResponse: {
    type: "object",
    properties: {
      global: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionSearch",
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
  ConventionSearch: {
    type: "object",
    properties: {
      conv_id: {
        type: "number",
        description: "ID convention",
      },
      version: {
        type: "number",
        description: "Version convention",
      },
      raison_sociale: {
        type: "string",
        description: "Company name",
      },
      typ_conv: {
        type: "string",
        description: "Convention type (COWORKING, PEPINIERE)",
      },
      date_debut: {
        type: "string",
        description: "Begin date convention",
      },
      date_fin: {
        type: "string",
        description: "End date convention",
      },
      statut: {
        type: "string",
        description: "Active or Resilié",
      },
    },
  },
  ConventionChecksResponse: {
    type: "object",
    properties: {
      checkAnniversaire: {
        type: "boolean",
      },
      checkFiles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            statut: {
              type: "string",
            },
            verified: {
              type: "boolean",
            },
          },
        },
      },
    },
  },
  ConventionAvenantResponse: {
    type: "object",
    properties: {
      newVersion: {
        type: "number",
      },
      message: {
        type: "string",
      },
    },
  },
  ConventionAvenantLocalBody: {
    type: "object",
    properties: {
      ugs: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            ug_id: {
              type: "integer",
              nullable: false,
            },
            date_debut: {
              type: "string",
              format: "date",
            },
            date_fin: {
              type: "string",
              format: "date",
              nullable: true,
            },
            surface_rent: {
              type: "number",
              minimum: 1,
            },
            surface_available: {
              type: "number",
            },
            surface: {
              type: "number",
            },
            added: {
              type: "boolean",
            },
          },
          required: [
            "name",
            "ug_id",
            "date_debut",
            "surface_rent",
            "surface_available",
            "surface",
          ],
        },
      },
    },
  },
  NotificationSearch: {
    type: "object",
    properties: {
      conv_id: {
        type: "integer",
      },
      max_version: {
        type: "integer",
      },
      raison_sociale: {
        type: "string",
      },
      statut: {
        type: "string",
      },
    },
    required: ["conv_id", "max_version", "raison_sociale", "statut"],
  },
  NotificationsSearchResponse: {
    type: "object",
    properties: {
      notifications: {
        type: "array",
        items: {
          $ref: "#/components/schemas/NotificationSearch",
        },
      },
      cursor: {
        type: "object",
        properties: {
          next: {
            type: "integer",
            nullable: true,
          },
          prev: {
            type: "integer",
            nullable: true,
          },
        },
      },
      totalCount: {
        type: "integer",
        nullable: true,
      },
    },
    required: ["notifications", "cursor"],
  },
  ConventionInfos: {
    type: "object",
    properties: {
      batiment_id: {
        type: "integer",
      },
      date_signature: {
        type: "string",
        format: "date",
      },
      date_debut: {
        type: "string",
        format: "date",
      },
      date_fin: {
        type: "string",
        format: "date",
        nullable: true,
      },
      typ_conv: {
        type: "string",
        enum: ["PEPINIERE", "COWORKING"],
      },
      raison_sociale: {
        type: "string",
      },
      legal_form_id: {
        type: "integer",
        nullable: true,
      },
      tiepm_id: {
        type: "integer",
      },
      statut: {
        type: "string",
      },
      conv_age: {
        type: "integer",
      },
    },
    required: [
      "batiment_id",
      "date_signature",
      "date_debut",
      "typ_conv",
      "raison_sociale",
      "tiepm_id",
      "statut",
      "conv_age",
    ],
  },
  ConventionVersion: {
    type: "object",
    properties: {
      version: {
        type: "integer",
      },
      statut: {
        type: "string",
      },
      update_date: {
        type: "string",
      },
    },
    required: ["version", "statut", "update_date"],
  },
  ConventionSignataire: {
    type: "object",
    properties: {
      tiepp_id: {
        type: "integer",
      },
      libelle: {
        type: "string",
      },
      fonction: {
        type: "string",
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
    },
    required: ["tiepp_id", "libelle"],
  },
  ConventionEquipement: {
    type: "object",
    properties: {
      ug_name: {
        type: "string",
      },
      equipement_id: {
        type: "integer",
      },
      equipement_name: {
        type: "string",
      },
      equipement_prix: {
        type: "number",
        format: "float",
      },
      is_deleted: {
        type: "boolean",
      },
    },
    required: [
      "ug_name",
      "equipement_id",
      "equipement_name",
      "equipement_prix",
      "is_deleted",
    ],
  },
  ConventionRubrique: {
    type: "object",
    properties: {
      ug_id: {
        type: "integer",
      },
      ug_name: {
        type: "string",
      },
      equipement_id: {
        type: "integer",
        nullable: true,
      },
      equipement_name: {
        type: "string",
        nullable: true,
      },
      rubrique_id: {
        type: "integer",
      },
      periodicity: {
        type: "string",
      },
      condition_payment: {
        type: "string",
      },
      montant: {
        type: "number",
        format: "float",
      },
      rubrique: {
        type: "string",
      },
    },
    required: [
      "ug_id",
      "ug_name",
      "rubrique_id",
      "periodicity",
      "condition_payment",
      "montant",
      "rubrique",
    ],
  },
  ConventionUG: {
    type: "object",
    properties: {
      ug_id: {
        type: "integer",
      },
      surface_rent: {
        type: "number",
        format: "float",
      },
      date_debut: {
        type: "string",
        format: "date",
      },
      date_fin: {
        type: "string",
        format: "date",
        nullable: true,
      },
      name: {
        type: "string",
      },
    },
    required: ["ug_id", "surface_rent", "date_debut", "name"],
  },
  ConventionResponse: {
    type: "object",
    properties: {
      conventionInfos: {
        $ref: "#/components/schemas/ConventionInfos",
      },
      signataires: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionSignataire",
        },
      },
      ugs: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionUG",
        },
      },
      equipements: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionEquipement",
        },
      },
      rubriques: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionRubrique",
        },
      },
      conventionVersions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConventionVersion",
        },
      },
    },
    required: [
      "conventionInfos",
      "signataires",
      "ugs",
      "equipements",
      "rubriques",
      "conventionVersions",
    ],
  },
  ConventionSearchLocal: {
    type: "object",
    properties: {
      ug_id: {
        type: "number",
      },
      name: {
        type: "string",
      },
      surface: {
        type: "number",
      },
      surface_occupied: {
        type: "number",
      },
      surface_available: {
        type: "number",
      },
    },
  },
  ConventionSearchLocaux: {
    type: "array",
    items: {
      $ref: "#/components/schemas/ConventionSearchLocal",
    },
  },
  ConventionEquipementAvailable: {
    type: "object",
    properties: {
      equipement_id: {
        type: "integer",
      },
      name: {
        type: "string",
      },
      equipement_prix: {
        type: "number",
        format: "float",
      },
      nature_equipement_id: {
        type: "number",
      },
    },
    required: [
      "equipement_id",
      "name",
      "equipement_prix",
      "nature_equipement_id",
    ],
  },
  ConventionEquipementsAvailable: {
    type: "array",
    items: {
      $ref: "#/components/schemas/ConventionEquipementAvailable",
    },
  },
  ConventionCreationPepiniere: {
    type: "object",
    properties: {
      batiment_id: {
        type: "number",
        required: "true",
      },
      tiepm_id: {
        type: "number",
        required: "true",
      },
      raison_sociale: {
        type: "string",
        required: "true",
      },
      date_signature: {
        type: "string",
        required: "true",
      },
      date_debut: {
        type: "string",
        required: "true",
      },
      date_fin: {
        type: "string",
        nullable: "true",
      },
      signataires: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tiepp_id: {
              type: "number",
            },
            checked: {
              type: "boolean",
            },
          },
        },
        minItems: 1,
      },
      ugs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              required: "true",
            },
            ug_id: {
              type: "number",
              required: "true",
            },
            date_debut: {
              type: "string",
              required: "true",
            },
            date_fin: {
              type: "string",
              nullable: "true",
            },
            surface_rent: {
              type: "number",
              required: "true",
              minimum: 1,
            },
            surface_available: {
              type: "number",
              required: "true",
            },
            surface: {
              type: "number",
              required: "true",
            },
          },
        },
        minItems: 1,
      },
      equipements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            equipement_id: {
              type: "number",
              required: "true",
            },
            ug_id: {
              type: "number",
              required: "true",
            },
            equipement_prix: {
              type: "number",
              required: "true",
            },
          },
        },
      },
    },
  },
  ConventionCreationCoworking: {
    type: "object",
    properties: {
      batiment_id: {
        type: "number",
        required: "true",
      },
      tiepm_id: {
        type: "number",
        required: "true",
      },
      raison_sociale: {
        type: "string",
        required: "true",
      },
      date_signature: {
        type: "string",
        required: "true",
      },
      date_debut: {
        type: "string",
        required: "true",
      },
      date_fin: {
        type: "string",
        nullable: "true",
      },
      signataires: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tiepp_id: {
              type: "number",
            },
            checked: {
              type: "boolean"
            }
          }
        },
        minItems: 1,
      }
    }
  },
  ConventionCreationResponse:  {
    type: "object",
    properties: {
      id: {
        type: "number",
      },
      message: {
        type: "string",
      },
    },
  }
};
