import * as Yup from "yup";

export const validationSchemaPPPMInfos = Yup.object().shape({
  pm: Yup.object().shape({
    batiment_id: Yup.number().required("Le bâtiment est requis."),
    raison_sociale: Yup.string().required("La raison sociale est requise"),
    sigle: Yup.string().nullable(),
    legal_form_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    secteur_activite_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    activite: Yup.string().nullable(),
    date_creation_company: Yup.string().nullable(),
    email: Yup.string().nullable(),
    phone_number: Yup.string().nullable(),
    num_voie: Yup.string().nullable(),
    int_voie: Yup.string().nullable(),
    typ_voie: Yup.string().nullable(),
    complement_voie: Yup.string().nullable(),
    code_postal: Yup.string().nullable(),
    commune: Yup.string().nullable(),
    cedex: Yup.string().nullable(),
    pays: Yup.string().nullable(),
    qpv: Yup.string()
      .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
      .nullable(),
    zfu: Yup.string()
      .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
      .nullable(),
    siret: Yup.string().nullable(),
    capital_amount: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    date_end_exercise: Yup.string().nullable(),
    formule_id: Yup.number().required("La formule est requise."),
    date_debut_formule: Yup.string().required("La date de début est requise."),
    date_fin_formule: Yup.string().nullable(),
    rel_typ_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez choisir le type de la relation.")
      .nullable()
      .optional(),
    relation_date_debut: Yup.string().nullable(),
    relation_date_fin: Yup.string().nullable(),
  }),
  pp: Yup.object().shape({
    batiment_id: Yup.number().required("Le bâtiment est requis."),
    civilite: Yup.string()
      .oneOf(["Mr", "Mme", ""], "Veuillez choisir une des options.")
      .nullable(),
    surname: Yup.string().required("L'intitulé est requis."),
    first_name: Yup.string().required("Le prénom est requis."),
    birth_date: Yup.string().nullable(),
    birth_name: Yup.string().nullable(),
    email: Yup.string().required("L'email est requis."),
    phone_number: Yup.string().nullable(),
    num_voie: Yup.string().nullable(),
    int_voie: Yup.string().nullable(),
    typ_voie: Yup.string().nullable(),
    complement_voie: Yup.string().nullable(),
    code_postal: Yup.string().nullable(),
    commune: Yup.string().nullable(),
    cedex: Yup.string().nullable(),
    pays: Yup.string().nullable(),
    qpv: Yup.string()
      .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
      .nullable(),
    zfu: Yup.string()
      .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
      .nullable(),
    study_level_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    situation_before_prj_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    situation_socio_pro_id: Yup.string().nullable(),
    image_authorisation: Yup.string()
      .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
      .nullable(),
    activite_prj: Yup.string().required("L'intitulé est requis."),
    raison_social_prj: Yup.string().nullable(),
    date_debut_prj: Yup.string().nullable(),
    nb_dirigeants_prj: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .min(0, "La valeur doit être positive.")
      .nullable()
      .optional(),
    effectif_prj: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .min(0, "La valeur doit être positive.")
      .nullable()
      .optional(),
    legal_form_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    first_meeting_date: Yup.string().nullable(),
    first_meeting_hour_begin: Yup.string()
      .nullable()
      .length(5, "Le format doit être HH:MM")
      .when("first_meeting_date", {
        is: (value: string) => !!value,
        then: (schema) =>
          schema.required(
            "L'heure de début est obligatoire lorsque la date est renseignée."
          ),
      }),
    first_meeting_hour_end: Yup.string()
      .nullable()
      .length(5, "Le format doit être HH:MM")
      .when("first_meeting_date", {
        is: (value: string) => !!value,
        then: (schema) =>
          schema.required(
            "L'heure de fin est obligatoire lorsque la date est renseignée."
          ),
      }),
    prescriber_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
          (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .nullable()
      .optional(),
    first_meeting_feedback: Yup.string().nullable(),
    formule_wishes: Yup.object({
      "Extra-Muros": Yup.boolean().required("Extra-Muros is required."),
      Coworking: Yup.boolean().required("Coworking is required."),
      "Bureau Partagé": Yup.boolean().required("Bureau Partagé is required."),
      Bureau: Yup.boolean().required("Bureau is required."),
    }).required("formule_wishes is required."),
    surface_wishes: Yup.object()
      .test(
        "is-boolean-record",
        "surface_wishes must be a record with boolean values",
        (value: any) => {
          if (!value || typeof value !== "object") return false;
          return Object.values(value).every((val) => typeof val === "boolean");
        }
      )
      .required("surface_wishes is required."),
    date_entree_wished: Yup.string().nullable(),
    formule_id: Yup.number().required("La formule est requise."),
    date_debut_formule: Yup.string().required("La date de début est requise."),
    date_fin_formule: Yup.string().nullable(),
  }),
});
