export const adminSchemas = {
  ActionCollectiveBody: {
    type: "object",
    properties: {
      sujet_accompagnement_id: { type: "number" },
      typ_accompagnement_id: { type: "number" },
      hour_begin: { type: "string" },
      hour_end: { type: "string" },
      date_acc_suivi: { type: "string" },
      attendants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tiepp_id: { type: "number" },
            libelle: { type: "string" },
            suivi_id: { type: "number" },
          },
        },
      },
    },
  },
  ActionCollectiveResponse: {
    type: "array",
    items: {
      type: "object",
      properties: {
        sujet_accompagnement_id: { type: "number" },
        typ_accompagnement_id: { type: "number" },
        hour_begin: { type: "string" },
        hour_end: { type: "string" },
        date_acc_suivi: { type: "string" },
        attendants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tiepp_id: { type: "number" },
              libelle: { type: "string" },
              suivi_id: { type: "number" },
            },
          },
        },
      },
    },
  },
  BatimentsResponse: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        batiment_id: {
          type: "number",
        },
      },
    },
  },
  SurfacesResponse: {
    type: "array",
    items: {
      type: "object",
      properties: {
        surface: {
          type: "number",
        },
      },
    },
  },
  SurfacePrixResponse: {
    type: "object",
    properties: {
      pepiniere: {
        type: "object",
        properties: {
          prix: {
            type: "array",
            items: { $ref: "#/components/schemas/SurfacePrixUG" },
          },
          prix_date_debut: {
            type: "string",
          },
          prix_date_fin: {
            type: "string",
            nullable: true,
          },
        },
      },
      centre_affaires: {
        type: "object",
        properties: {
          prix: {
            type: "array",
            items: { $ref: "#/components/schemas/SurfacePrixUG" },
          },
          prix_date_debut: {
            type: "string",
          },
          prix_date_fin: {
            type: "string",
            nullable: true,
          },
        },
      },
      coworking: {
        type: "object",
        properties: {
          prix: {
            type: "array",
            items: { $ref: "#/components/schemas/SurfacePrixUG" },
          },
          prix_date_debut: {
            type: "string",
          },
          prix_date_fin: {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
  HistoriqueSurfacePrixResponse: {
    type: "object",
    properties: {
      historique: {
        type: "array",
        items: {
          type: "object",
          properties: {
            prix_type: {
              type: "string",
            },
            prix_date_debut: {
              type: "string",
            },
            prix_date_fin: {
              type: "string",
              nullable: true,
            },
            prix: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prix_id: { type: "integer" },
                  surface: { type: "number" },
                  batiment_id: { type: "integer" },
                  prix_an_1: { type: "number", nullable: true },
                  prix_an_2: { type: "number", nullable: true },
                  prix_an_3: { type: "number", nullable: true },
                  prix_centre_affaires: { type: "number", nullable: true },
                  prix_coworking: { type: "number", nullable: true },
                },
              },
            },
          },
        },
      },
      cursor: {
        type: "number",
        nullable: true,
      },
    },
  },
  SurfacePrixUpdateBody: {
    type: "object",
    properties: {
      prix: {
        type: "array",
        items: { $ref: "#/components/schemas/SurfacePrixUG" },
      },
      prix_date_debut: {
        type: "string",
      },
      prix_date_fin: {
        type: "string",
        nullable: true,
      },
      prix_type: {
        type: "string",
        enum: ["pepiniere", "centre_affaires", "coworking"],
      },
    },
    required: ["prix", "prix_date_debut", "prix_type"],
  },
  SurfacePrixUG: {
    type: "object",
    properties: {
      prix_id: { type: "integer" },
      batiment_id: { type: "integer" },
      surface: { type: "number" },
      prix_type: {
        type: "string",
        enum: ["pepiniere", "centre_affaires", "coworking"],
      },
      prix_an_1: { type: "number", nullable: true },
      prix_an_2: { type: "number", nullable: true },
      prix_an_3: { type: "number", nullable: true },
      prix_centre_affaires: { type: "number", nullable: true },
      prix_coworking: { type: "number", nullable: true },
    },
  },
};
