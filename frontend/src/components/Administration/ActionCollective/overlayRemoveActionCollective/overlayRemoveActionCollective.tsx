import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import { ActionCollective } from "../../../../types/Admin/Administration";
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";

export default function OverlayRemoveActionCollective({
  setIsOpen,
  actionCollective,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  actionCollective: ActionCollective;
}) {
  const queryClient = useQueryClient();
  const { sujetsAcc } = useSujetsAcc();
  const [message, setMessage] = useState("");

  const deleteActionCollective = async () => {
    try {
      setMessage("");

      const response = await customRequest.delete(
        `/tiers/admin/action-collective/${actionCollective.sujet_accompagnement_id}`
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

  const deleteActionCollectiveMutation = useMutation({
    mutationFn: deleteActionCollective,
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["actions_collectives"],
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
          Voulez-vous vraiment supprimer l'action collective{" "}
          {
            sujetsAcc.find(
              (sujetAcc) =>
                sujetAcc.sujet_accompagnement_id ===
                actionCollective.sujet_accompagnement_id
            )?.name
          }{" "}
          ?
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
          {deleteActionCollectiveMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {deleteActionCollectiveMutation.isError && message && (
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
            onClick={() => deleteActionCollectiveMutation.mutate()}
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
