import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";

export default function AddAccount() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const validationSchemaAccount = Yup.object().shape({
    first_name: Yup.string().required("Le prénom est requis."),
    last_name: Yup.string().required("Le nom de famille est requis."),
    email: Yup.string()
      .required("Email est requis.")
      .email("Email must be a valid email address."),
    role: Yup.string()
      .required("Le rôle est requis.")
      .oneOf(["admin", "user"], "Veuillez choisir une des options."),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAccount),
  });

  const addAccount = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  }) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/users/sign-up`, data);

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

  const addAccountMutation = useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      role: string;
    }) => addAccount(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      reset({
        first_name: "",
        last_name: "",
        email: "",
        role: "",
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  }) => {
    addAccountMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un compte
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Nom*
              </Typography>
              <TextField fullWidth {...register("last_name")} />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.last_name && (
                <Typography>{errors.last_name.message}</Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Prénom*
              </Typography>
              <TextField fullWidth {...register("first_name")} />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.first_name && (
                <Typography>{errors.first_name.message}</Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Email*
              </Typography>
              <TextField fullWidth {...register("email")} />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.email && <Typography>{errors.email.message}</Typography>}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Rôle*
              </Typography>
              <Select {...register("role")}>
                <MenuItem key="" value="">
                  --------
                </MenuItem>
                <MenuItem key="admin" value="admin">
                  Administrateur
                </MenuItem>
                <MenuItem key="user" value="user">
                  Utilisateur
                </MenuItem>
              </Select>
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.role && <Typography>{errors.role.message}</Typography>}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          disabled={addAccountMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter un compte
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addAccountMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addAccountMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
