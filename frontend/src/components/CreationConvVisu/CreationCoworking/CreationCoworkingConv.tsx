import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import customRequest from "../../../routes/api/api";
import { CreateCoworkingConvention } from "../../../types/convention/convention";
import CreationSignatairesCoworkingConv from "./SignatairesCoworking/signatairesCoworkingConv";
import CreationInfosCoworkingConv from "./InfosCoworkingConv/InfosCoworkingConv";
import { validationSchemaCoworkingCreation } from "./validationSchemaCoworkingConv";

export default function CreationCoworkingVisu() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaCoworkingCreation),
  });

  const { update: updateSignataires } = useFieldArray({
    control,
    name: "signataires",
  });


  const conventionCoworkingSave = async (data: CreateCoworkingConvention) => {
    try {
      setMessage("");

      const response = await customRequest.post(
        `/convention/create-coworking`,
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

  const conventionCoworkingSaveMutation = useMutation({
    mutationFn: (data: CreateCoworkingConvention) => conventionCoworkingSave(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/convention/recherche/visualisation/${data.id}/1`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreateCoworkingConvention) => {
    conventionCoworkingSaveMutation.mutate(data);
  };

  const tiepmId = watch("tiepm_id");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <CreationInfosCoworkingConv
        register={register}
        errors={errors}
        setValue={setValue}
      />

      <CreationSignatairesCoworkingConv
        update={updateSignataires}
        register={register}
        getValues={getValues}
        errors={errors}
        setValue={setValue}
        tiepmId={tiepmId}
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
          Créer la convention coworking
        </Button>
        {conventionCoworkingSaveMutation.isSuccess && message && (
          <Typography sx={{ color: "success.main" }}>{message}</Typography>
        )}
        {conventionCoworkingSaveMutation.isError && message && (
          <Typography sx={{ color: "error.main" }}>{message}</Typography>
        )}
      </Box>
    </Box>
  );
}
