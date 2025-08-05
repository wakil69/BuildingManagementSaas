export const ugSchema = {
  EquipmentBody: {
    type: "object",
    properties: {
      nature_equipement_id: { type: "number" },
      name: { type: "string" },
      equipement_prix: { type: "number" }
    },
  },
  UgInfosBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      nature_ug_id: { type: "number" },
      batiment_id: { type: "number" },
      num_voie: { type: "string", nullable: true },
      typ_voie: { type: "string", nullable: true },
      int_voie: { type: "string" },
      complement_voie: { type: "string", nullable: true },
      code_postal: { type: "string" },
      commune: { type: "string" },
      cedex: { type: "string", nullable: true },
      pays: { type: "string" },
      surface: { type: "number" },
      etage_id: { type: "number" },
      date_construction: { type: "string", format: "date", nullable: true },
      date_entree: { type: "string", format: "date", nullable: true },
    },
  },
  UgFilesResponse: {
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
  UgInfosResponse: {
    type: "object",
    properties: {
      ugInfos: {
        type: "object",
        properties: {
          ug_id: { type: "string" },
          name: { type: "string" },
          nature_ug_id: { type: "number" },
          batiment_id: { type: "number" },
          num_voie: { type: "string", nullable: true },
          typ_voie: { type: "string", nullable: true },
          int_voie: { type: "string" },
          complement_voie: { type: "string", nullable: true },
          code_postal: { type: "string" },
          commune: { type: "string" },
          cedex: { type: "string", nullable: true },
          pays: { type: "string" },
          surface: { type: "number" },
          etage_id: { type: "number" },
          date_construction: { type: "string", format: "date", nullable: true },
          date_entree: { type: "string", format: "date", nullable: true },
        },
        required: [
          "ug_id",
          "name",
          "nature",
          "batiment_name",
          "num_voie",
          "typ_voie",
          "int_voie",
          "complement_voie",
          "code_postal",
          "commune",
          "pays",
          "surface",
          "date_construction",
          "date_entree",
        ],
      },
      prix: {
        type: "object",
        properties: {
          prix_an_1: { type: "number", nullable: true },
          prix_an_2: { type: "number", nullable: true },
          prix_an_3: { type: "number", nullable: true },
          prix_centre_affaires: { type: "number", nullable: true },
        },
      },
      equipements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            name: { type: "string" },
            equipement_prix: { type: "number" },
            equipement_id: { type: "number"}
          },
          required: ["nature", "name", "equipement_prix", "equipement_id"],
        },
      },
    },
    required: ["ugInfos", "prix", "equipements"],
  },
  UgsSearchResponse: {
    type: "object",
    properties: {
      ugs: {
        type: "array",
        items: {
          $ref: "#/components/schemas/UgSearch",
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
        description: "Total number of UGs matching the query",
      },
    },
  },
  UgSearch: {
    type: "object",
    properties: {
      ugId: {
        type: "string",
        description: "Unique identifier for the UG",
      },
      name: {
        type: "string",
        description: "Name of the UG",
      },
      nature: {
        type: "string",
        description: "Type or nature of the UG",
      },
      address: {
        type: "string",
        description: "Address of the UG",
      },
      surface: {
        type: "number",
        format: "float",
        description: "Total surface area of the UG in square meters",
      },
      num_etage: {
        type: "number",
        format: "int32",
        description: "Floor number where the UG is located",
      },
      surface_occupe: {
        type: "number",
        format: "float",
        description: "Occupied surface area of the UG in square meters",
      },
    },
  },
};
