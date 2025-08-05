import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import customRequest from "../../../routes/api/api";
import CreationInfosPepConv from "./InfosPepConv/InfosPepConv";
import { validationSchemaPepCreation } from "./validationSchemaPepConv";
import CreationSignatairesPepConv from "./SignatairesConv/signatairesPepConv";
import CreationLocauxPepConv from "./LocauxConv/LocauxPepConv";
import CreationEquipementsPepConv from "./EquipementsPepConv/EquipementsPepConv";
import { CreatePepConvention } from "../../../types/convention/convention";

export default function CreationPepVisu() {
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
    resolver: yupResolver(validationSchemaPepCreation),
  });

  const { update: updateSignataires } = useFieldArray({
    control,
    name: "signataires",
  });

  const {
    fields: fieldsLocaux,
    append: appendLocaux,
    remove: removeLocaux,
  } = useFieldArray({
    control,
    name: "ugs",
  });

  const { append: appendEquipements, remove: removeEquipements, fields: fieldsEquipements } =
    useFieldArray({
      control,
      name: "equipements",
    });

  const conventionPepSave = async (data: CreatePepConvention) => {
    try {
      setMessage("");

      const response = await customRequest.post(
        `/convention/create-pepiniere`,
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

  const conventionPepSaveMutation = useMutation({
    mutationFn: (data: CreatePepConvention) => conventionPepSave(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/convention/recherche/visualisation/${data.id}/1`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreatePepConvention) => {
    conventionPepSaveMutation.mutate(data);
  };

  const tiepmId = watch("tiepm_id");
  const batimentId = watch("batiment_id");
  const ugs = watch("ugs");
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <CreationInfosPepConv
        register={register}
        errors={errors}
        setValue={setValue}
      />

      <CreationSignatairesPepConv
        update={updateSignataires}
        register={register}
        getValues={getValues}
        errors={errors}
        setValue={setValue}
        tiepmId={tiepmId}
      />

      <CreationLocauxPepConv
        append={appendLocaux}
        remove={removeLocaux}
        register={register}
        fields={fieldsLocaux}
        getValues={getValues}
        errors={errors}
        setValue={setValue}
        batimentId={batimentId}
        watch={watch}
      />

      <CreationEquipementsPepConv
        append={appendEquipements}
        remove={removeEquipements}
        register={register}
        getValues={getValues}
        fields={fieldsEquipements}
        errors={errors}
        setValue={setValue}
        batimentId={batimentId}
        watch={watch}
        ugs={ugs}
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
          Créer la convention pépinière
        </Button>
        {conventionPepSaveMutation.isSuccess && message && (
          <Typography sx={{ color: "success.main" }}>{message}</Typography>
        )}
        {conventionPepSaveMutation.isError && message && (
          <Typography sx={{ color: "error.main" }}>{message}</Typography>
        )}
      </Box>
    </Box>
  );
}
