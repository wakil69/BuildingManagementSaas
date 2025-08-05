import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormulePM, FormulePP } from "../../../../types/tiers/tiers";
import customRequest from "../../../../routes/api/api";
import { convertDateFormat } from "../../../../utils/functions";

export default function OverlayRemoveFormule({
  setIsOpen,
  formule,
  qualite,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  formule: FormulePP | FormulePM;
  qualite?: "PP" | "PM";
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const deleteFormule = async () => {
    try {
      setMessage("");
      const formuleId =
        "form_pp_id" in formule
          ? formule.form_pp_id
          : "form_pm_id" in formule
          ? formule.form_pm_id
          : null;

      if (!formuleId) {
        throw new Error(`Erreur: Vous n'avez pas sélectionné la formule.`);
      }
      const response = await customRequest.delete(
        `/tiers/formule/${qualite}/${id}/${formuleId}`
      );

      if (response.status !== 200) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const deleteFileMutation = useMutation({
    mutationFn: deleteFormule,
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["tiers", qualite, id],
      });
      setIsOpen(null);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Voulez-vous vraiment supprimer la formule qui débute le{" "}
          {convertDateFormat(formule.date_debut_formule || "")}{" "}
          {formule.date_fin_formule
            ? `et se finit
          ${convertDateFormat(formule.date_fin_formule || "")} ?`
            : "?"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          {deleteFileMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {deleteFileMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
          <Button
            onClick={() => setIsOpen(null)}
            color="secondary"
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={() => deleteFileMutation.mutate()}
            color="primary"
            variant="contained"
          >
            Supprimer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
