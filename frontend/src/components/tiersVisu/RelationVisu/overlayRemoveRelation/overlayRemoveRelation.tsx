import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import { convertDateFormat } from "../../../../utils/functions";
import { Company, Dirigeant } from "../../../../types/tiers/tiers";

export default function OverlayRemoveRelation({
  setIsOpen,
  relation,
  qualite,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  relation: Company | Dirigeant;
  qualite?: "PP" | "PM";
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const deleteFormule = async () => {
    try {
      setMessage("");

      if (!relation.rel_id) {
        throw new Error(`Erreur: Vous n'avez pas sélectionné la formule.`);
      }

      const response = await customRequest.delete(
        `/tiers/relations/${qualite}/${id}/${relation.rel_id}`
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
    <Card
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Voulez-vous vraiment supprimer la relation avec{" "}
          {qualite === "PP"
            ? (relation as Company).raison_sociale
            : (relation as Dirigeant).libelle}{" "}
          {relation.relation_date_debut
            ? `qui débute le
          ${convertDateFormat(relation.relation_date_debut || "")}`
            : ""}
          {relation.relation_date_fin
            ? `et se finit
          ${convertDateFormat(relation.relation_date_fin || "")} ?`
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
