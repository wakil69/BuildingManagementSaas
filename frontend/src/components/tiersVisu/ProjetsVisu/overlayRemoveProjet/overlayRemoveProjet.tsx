import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import { Projet } from "../../../../types/tiers/tiers";

export default function OverlayRemoveProjet({
  setIsOpen,
  projet,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  projet: Projet;
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const projetDelete = async () => {
    try {
      setMessage("");
      const response = await customRequest.delete(
        `/tiers/projet/PP/${id}/${projet.prj_id}`
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const projetDeleteMutation = useMutation({
    mutationFn: projetDelete,
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({
        queryKey: ["tiers", "PP", id],
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
          Voulez-vous vraiment supprimer le projet {projet.raison_social_prj} ?
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
          {projetDeleteMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {projetDeleteMutation.isError && message && (
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
            onClick={() => projetDeleteMutation.mutate()}
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
