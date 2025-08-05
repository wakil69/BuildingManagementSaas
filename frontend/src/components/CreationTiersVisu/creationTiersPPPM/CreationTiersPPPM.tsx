import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import customRequest from "../../../routes/api/api";
import { CreatePPPM } from "../../../types/tiers/tiers";
import { validationSchemaPPPMInfos } from "./validationSchemaPPPM";
import CreationTiersPMForPPPM from "./creationTiersPMForPPPM/creationTiersPMForPPPM";
import CreationTiersPPForPPPM from "./creationTiersPPForPPPM/creationTiersPPForPPPM";

export default function CreationTiersPPPMVisu() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreatePPPM>({
    resolver: yupResolver(validationSchemaPPPMInfos),
  });

  const tiersSave = async (data: CreatePPPM) => {
    try {
      setMessage("");

      const response = await customRequest.post(`/tiers/create-pp-pm`, {
        pm: data.pm,
        pp: {
          ...data.pp,
          surface_wishes: JSON.stringify(data.pp.surface_wishes),
          formule_wishes: JSON.stringify(data.pp.formule_wishes),
        },
      });

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

  const tiersSaveMutation = useMutation({
    mutationFn: (data: CreatePPPM) => tiersSave(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/tiers/recherche/visualisation/PM/${data.id}`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreatePPPM) => {
    tiersSaveMutation.mutate(data);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <CreationTiersPPForPPPM
        register={register}
        getValues={getValues}
        errors={errors}
        setValue={setValue}
      />
      <CreationTiersPMForPPPM
        register={register}
        getValues={getValues}
        errors={errors}
        setValue={setValue}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mt: 3,
        }}
      >
        <Button
          onClick={() => handleSubmit(onSubmit)()}
          color="primary"
          variant="contained"
        >
          Ajouter la paire PP-PM
        </Button>
        {tiersSaveMutation.isSuccess && message && (
          <Typography sx={{ color: "success.main" }}>{message}</Typography>
        )}
        {tiersSaveMutation.isError && message && (
          <Typography sx={{ color: "error.main" }}>{message}</Typography>
        )}
      </Box>
    </Box>
  );
}
