import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Button,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFieldArray, useForm } from "react-hook-form";
import { ConventionUG } from "../../../../types/convention/convention";
import { useNavigate } from "react-router-dom";
import RowUgUpdateConv from "./rowUgpdateConv/rowUgUpdateConv";

const validationSchemaAddAvenantLocal = Yup.object().shape({
  ugs: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Le local est requis."),
        ug_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .required("Le local est requis."),
        date_debut: Yup.string().required("La date de début est requise."),
        date_fin: Yup.string()
          .nullable()
          .test(
            "is-after-date_debut",
            "La date de fin doit être postérieure à la date de début.",
            function (value) {
              const { date_debut } = this.parent;
              if (!value || !date_debut) return true;
              return new Date(value) > new Date(date_debut);
            }
          ),
        surface_rent: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .min(1, "veuillez entrer une valeur correcte")
          .required("La surface est requise"),
        surface_available: Yup.number().required(
          "La surface disponible est requise"
        ),
        surface: Yup.number().required("La surface du local est requise"),
        added: Yup.boolean(),
      })
    )
    .min(1, "La convention doit avoir au moins un local.")
    .test("unique-ug_id", "Chaque local doit être unique.", (ugs) => {
      if (!Array.isArray(ugs)) return true;
      const ugIds = ugs.map((ug) => ug.ug_id);
      const uniqueUgIds = new Set(ugIds);
      return uniqueUgIds.size === ugIds.length;
    }),
});

export type AddAvenantLocalType = Yup.InferType<
  typeof validationSchemaAddAvenantLocal
>;

export default function OverlayAddAvenantLocal({
  setIsOpen,
  ugs,
  convId,
  version,
  batimentId,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ugs: ConventionUG[];
  convId?: string;
  version?: string;
  batimentId: number;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddAvenantLocal),
    defaultValues: {
      ugs,
    },
  });

  const {
    fields: fieldsLocaux,
    append: appendLocaux,
    remove: removeLocaux,
  } = useFieldArray({
    control,
    name: "ugs",
  });

  const addAvenantLocal = async (data: AddAvenantLocalType) => {
    try {
      setMessage("");

      const response = await customRequest.post(
        `/convention/avenant-local/${convId}/${version}`,
        data
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

  const addAvenantLocalMutation = useMutation({
    mutationFn: (data: AddAvenantLocalType) => addAvenantLocal(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", "files", convId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", convId],
      });
      setIsOpen(false);

      if (data.newVersion) {
        navigate(
          `/pageConnecte/convention/recherche/visualisation/${convId}/${data.newVersion}`
        );
      }
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: AddAvenantLocalType) => {
    addAvenantLocalMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Ajout d'un avenant local
        </Typography>
        <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
          <Box sx={{ marginY: 3 }}>
            <Button
              onClick={() =>
                appendLocaux({
                  ug_id: 0,
                  date_debut: "",
                  date_fin: null,
                  surface_rent: 0,
                  name: "",
                  surface_available: 0,
                  surface: 0,
                  added: true,
                })
              }
              color="primary"
              variant="contained"
            >
              Ajouter un local
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography align="center" fontWeight="600">
                        Date de début
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography align="center" fontWeight="600">
                        Date de fin
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="600">Local</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="600">
                        Surface disponible
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="600">Surface loué</Typography>
                    </TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fieldsLocaux.length
                    ? fieldsLocaux.map((_: any, index: number) => (
                        <RowUgUpdateConv
                          key={index}
                          index={index}
                          errors={errors}
                          register={register}
                          getValues={getValues}
                          setValue={setValue}
                          watch={watch}
                          batimentId={batimentId}
                          remove={removeLocaux}
                          convId={convId}
                          version={version}
                        />
                      ))
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.ugs && errors.ugs.root && (
                <Typography>{errors.ugs.root.message}</Typography>
              )}
              {errors.ugs && <Typography>{errors.ugs.message}</Typography>}
            </Box>
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
          {addAvenantLocalMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addAvenantLocalMutation.isError && message && (
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
            onClick={() => handleSubmit(onSubmit)()}
            color="primary"
            variant="contained"
          >
            Ajouter un avenant local
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
