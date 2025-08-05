import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useMutation } from "@tanstack/react-query";
import customRequest from "../../../routes/api/api";
import { useState } from "react";
import { Box, Typography } from "@mui/material";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const forgotPassword = async (data: { email: string }) => {
    try {
      setMessage("");

      const response = await customRequest.post(
        `/users/forgotten-password`,
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

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: { email: string }) => forgotPassword(data),
    onSuccess: (data) => {
      setMessage(data.message);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Réinitialiser votre mot de passe</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <DialogContentText>
          Entrez l&apos;adresse e-mail de votre compte, et nous vous enverrons
          un lien pour réinitialiser votre mot de passe.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {forgotPasswordMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {forgotPasswordMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          variant="contained"
          type="submit"
          disabled={
            forgotPasswordMutation.isSuccess || forgotPasswordMutation.isPending
          }
          onClick={() => forgotPasswordMutation.mutate({ email })}
        >
          Continuer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
