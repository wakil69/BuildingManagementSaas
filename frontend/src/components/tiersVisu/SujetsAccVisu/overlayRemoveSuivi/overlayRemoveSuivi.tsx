import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import { Suivi } from "../../../../types/tiers/tiers";

export default function OverlayRemoveSuivi({
  setIsOpen,
  suivi,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  suivi: Suivi;
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const suiviDelete = async () => {
    try {
      setMessage("");
      const response = await customRequest.delete(
        `/tiers/suivi/PP/${id}/${suivi.suivi_id}`
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

  const suiviDeleteMutation = useMutation({
    mutationFn: suiviDelete,
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
          Voulez-vous vraiment supprimer l'accompagnement {suivi.date_acc_suivi}{" "}
          - {suivi.hour_begin} - {suivi.hour_end} ?
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
          {suiviDeleteMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {suiviDeleteMutation.isError && message && (
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
            onClick={() => suiviDeleteMutation.mutate()}
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
