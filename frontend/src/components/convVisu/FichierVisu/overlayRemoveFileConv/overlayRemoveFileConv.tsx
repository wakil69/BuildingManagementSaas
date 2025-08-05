import { useState } from "react";
import { Card, CardContent, Box, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";

export default function OverlayRemoveFileConv({
  setIsOpen,
  filename,
  version,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  filename: string;
  version?: string;
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const deleteFile = async (data: { filename: string }) => {
    try {
      setMessage("");
      const response = await customRequest.put(
        `/convention/files/${id}/${version}`,
        data
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

  const deleteFileMutation = useMutation({
    mutationFn: (data: { filename: string }) => deleteFile(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", "files", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", id]
      })
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
          Voulez-vous vraiment supprimer le fichier {filename}
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
            onClick={() => deleteFileMutation.mutate({ filename })}
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
