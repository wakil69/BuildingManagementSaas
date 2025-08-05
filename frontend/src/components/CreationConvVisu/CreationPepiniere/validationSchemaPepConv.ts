import * as Yup from "yup";

export const validationSchemaPepCreation = Yup.object().shape({
  batiment_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .required("Le bâtiment est requis."),
  tiepm_id: Yup.number().required("La raison sociale est requise"),
  raison_sociale: Yup.string().required("La raison sociale est requise"),
  date_signature: Yup.string().required("La date de signature est requise."),
  date_debut: Yup.string().required("La date de début est requise."),
  date_fin: Yup.string()
    .nullable()
    .test(
      "is-after-date_debut",
      "La date de fin doit être postérieure à la date de début.",
      function (value) {
        const { date_debut } = this.parent;
        if (!value || !date_debut) return true;
        return new Date(value) >= new Date(date_debut);
      }
    ),
  signataires: Yup.array()
    .of(
      Yup.object().shape({
        tiepp_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre."),
        checked: Yup.boolean(),
      })
    )
    .min(1, "La convention doit avoir au moins un signataire.")
    .test(
      "at-least-one-checked",
      "La convention doit avoir au moins un signataire sélectionné.",
      (signataires) =>
        Array.isArray(signataires) &&
        signataires.some((signataire) => signataire.checked === true)
    ),
  ugs: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Le local est requis."),
        ug_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .required("Le local est requis."),
        date_debut: Yup.string().required("La date de début est requise."),
        date_fin: Yup.string()
          .nullable()
          .test(
            "is-after-date_debut",
            "La date de fin doit être postérieure à la date de début.",
            function (value) {
              const { date_debut } = this.parent;
              if (!value || !date_debut) return true;
              return new Date(value) > new Date(date_debut);
            }
          ),
        surface_rent: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .min(1, "veuillez entrer une valeur correcte")
          .required("La surface est requise"),
        surface_available: Yup.number().required(
          "La surface disponible est requise"
        ),
        surface: Yup.number().required("La surface du local est requise"),
      })
    )
    .min(1, "La convention doit avoir au moins un local.")
    .test("unique-ug_id", "Chaque local doit être unique.", (ugs) => {
      if (!Array.isArray(ugs)) return true;
      const ugIds = ugs.map((ug) => ug.ug_id);
      const uniqueUgIds = new Set(ugIds);
      return uniqueUgIds.size === ugIds.length;
    }),
  equipements: Yup.array()
    .of(
      Yup.object().shape({
        equipement_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .required("Le local est requis."),
        ug_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .required("Le local est requis."),
        equipement_prix: Yup.number().required("La prix est requis."),
      })
    )
    .test(
      "unique-equipement-id",
      "Chaque équipement doit être unique.",
      (equipements) => {
        if (!Array.isArray(equipements)) return true;
        const ids = equipements.map((equipement) => equipement.equipement_id);
        const uniqueIds = new Set(ids);
        return uniqueIds.size === ids.length;
      }
    )
    .test(
      "all-ug_id-in-ugs",
      "Chaque équipement doit être associé aux locaux choisis.",
      function (equipements) {
        const { ugs } = this.parent;
        if (!Array.isArray(equipements) || !Array.isArray(ugs)) return true;

        const ugIdsInUgs = new Set(ugs.map((ug) => ug.ug_id));
        return equipements.every((equipement) =>
          ugIdsInUgs.has(equipement.ug_id)
        );
      }
    ),
});
