import * as Yup from "yup";

export const validationSchemaCoworkingCreation = Yup.object().shape({
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
});
