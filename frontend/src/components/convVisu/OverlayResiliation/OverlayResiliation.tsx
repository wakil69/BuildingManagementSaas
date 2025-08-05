import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Button,
  Typography,
  Paper,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import customRequest from "../../../routes/api/api";

export default function OverlayResiliation({
  setIsOpen,
  convId,
  version,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  convId?: string;
  version?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [dateResiliation, setDateResiliation] = useState("")
  const navigate = useNavigate();

  const resilierConvention = async () => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/convention/resiliation/${convId}/${version}`, { date_fin: dateResiliation }
      );

      if (response.status !== 200) {
        throw new Error("File upload failed.");
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

  const resilierConventionMutation = useMutation({
    mutationFn: resilierConvention,
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", convId],
      });
      if (data.newVersion) {
        navigate(
          `/pageConnecte/convention/recherche/visualisation/${convId}/${data.newVersion}`
        );
      }
      setTimeout(() => {
        setMessage("");
      }, 3000);
      setIsOpen(false)
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
          Résilier la convention
        </Typography>
        <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Typography color="error">
              Attention, cette action est irréversible.
            </Typography>
            <TextField
              fullWidth
              type="date"
              onChange={(e) => setDateResiliation(e.target.value)}
              value={dateResiliation}
            />
          </Box>
        </Paper>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          {resilierConventionMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {resilierConventionMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
          <Button
            onClick={() => setIsOpen(false)}
            color="secondary"
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={() => resilierConventionMutation.mutate()}
            color="warning"
            variant="contained"
          >
            Résilier la convention
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
