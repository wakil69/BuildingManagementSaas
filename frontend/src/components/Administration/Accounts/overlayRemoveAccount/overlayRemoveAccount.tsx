import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";

export default function OverlayRemoveAccount({
  setIsOpen,
  firstName,
  surname,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  firstName: string;
  surname: string;
  id?: number;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const deleteParam = async () => {
    try {
      setMessage("");
      const response = await customRequest.delete(
        `/users/account/${id}`
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

  const deleteParamMutation = useMutation({
    mutationFn: deleteParam,
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
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
          Voulez-vous vraiment supprimer le compte de {firstName} {surname} ?
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
          {deleteParamMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {deleteParamMutation.isError && message && (
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
            onClick={() => deleteParamMutation.mutate()}
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
