import countryList from "react-select-country-list";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../routes/api/api";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { PMInfos } from "../../../types/tiers/tiers";
import { useBatiments } from "../../../hooks/tiers/useBatiments";
import { useLegalForms } from "../../../hooks/tiers/useLegalForms";
import { convertDateFormat } from "../../../utils/functions";
import { useCodeAPEList } from "../../../hooks/tiers/useCodeApeList";
import { useSecteursActivites } from "../../../hooks/tiers/useSecteursActivites";

type FieldName = keyof Yup.InferType<typeof validationSchemaPMInfos>;

const validationSchemaPMInfos = Yup.object().shape({
  batiment_id: Yup.number().required("Le bâtiment est requis."),
  raison_sociale: Yup.string().required("La raison sociale est requise"),
  sigle: Yup.string().nullable(),
  legal_form_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  activite: Yup.string().nullable(),
  date_creation_company: Yup.string().nullable(),
  email: Yup.string().nullable(),
  phone_number: Yup.string().nullable(),
  num_voie: Yup.string().nullable(),
  int_voie: Yup.string().nullable(),
  typ_voie: Yup.string().nullable(),
  complement_voie: Yup.string().nullable(),
  code_postal: Yup.string().nullable(),
  commune: Yup.string().nullable(),
  cedex: Yup.string().nullable(),
  pays: Yup.string().nullable(),
  qpv: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
  zfu: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
  siret: Yup.string().nullable(),
  code_ape: Yup.string().nullable(),
  secteur_activite_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  capital_amount: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  date_end_exercise: Yup.string().nullable(),
});

export default function InfosPMVisu({
  tiersInfos,
  id,
}: {
  tiersInfos: PMInfos;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const pays = useMemo(() => countryList().getData(), []);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const { codeAPEList } = useCodeAPEList();
  const { secteursActivites, isLoadingSecteursActivites } =
    useSecteursActivites();
  const {
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaPMInfos),
    defaultValues: tiersInfos,
  });

  const tiersUpdate = async (data: PMInfos) => {
    try {
      setMessage("");
      const response = await customRequest.put(
        `/tiers/infos-gen/PM/${id}`,
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

  const tiersUpdateMutation = useMutation({
    mutationFn: (data: PMInfos) => tiersUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["tiers", "PM", id],
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: PMInfos) => {
    tiersUpdateMutation.mutate(data);
  };

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || undefined);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.3s, transform 0.3s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: "scale(1.02)",
          },
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Informations sur le tiers</Typography>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              padding: 3,
              backgroundColor: "#F0F8FF",
              borderRadius: 10,
              boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Box
              sx={{
                marginY: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: 3,
              }}
            >
              {!editable ? (
                <IconButton aria-label="edit" onClick={() => setEditable(true)}>
                  <EditIcon fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="edit"
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  <SaveIcon fontSize="large" />
                </IconButton>
              )}
              {tiersUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {tiersUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                padding: 3,
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
                  <Typography sx={{ fontWeight: "bold" }}>ID</Typography>
                  <Typography>{id}</Typography>
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}></Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold" }}>Bâtiment</Typography>
                  {editable && !isLoadingBatiments ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("batiment_id", {
                          onChange: (e) => {
                            setValue("batiment_id", e.target.value);
                          },
                        })}
                        name="batiment"
                        id="batiment"
                        defaultValue={tiersInfos.batiment_id}
                      >
                        {batiments.map((data) => (
                          <MenuItem
                            key={data.batiment_id}
                            value={data.batiment_id}
                          >
                            {data.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>
                      {
                        batiments.find(
                          (batiment) =>
                            batiment.batiment_id === getValues("batiment_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.batiment_id && (
                    <Typography>{errors.batiment_id.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Dénomination entreprise{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("raison_sociale", {
                        onChange: (e) => setUpperCase("raison_sociale", e),
                      })}
                      id="raison_sociale"
                      name="raison_sociale"
                    />
                  ) : (
                    <Typography>{getValues("raison_sociale")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.raison_sociale && (
                    <Typography>{errors.raison_sociale.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>Sigle</Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("sigle", {
                        onChange: (e) => setUpperCase("sigle", e),
                      })}
                      id="sigle"
                      name="sigle"
                    />
                  ) : (
                    <Typography>{getValues("sigle")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.sigle && (
                    <Typography>{errors.sigle.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Statut juridique
                  </Typography>
                  {editable && !isLoadingLegalForms && legalForms.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("legal_form_id")}
                          name="legal_form_id"
                          id="legal_form_id"
                          defaultValue={tiersInfos.legal_form_id || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {legalForms.map((data) => (
                            <MenuItem
                              key={data.legal_form_id}
                              value={data.legal_form_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#legal-forms",
                            "_blank"
                          )
                        }
                      >
                        <AddIcon fontSize="large" />
                      </IconButton>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["legal_forms"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        legalForms.find(
                          (legalForm) =>
                            legalForm.legal_form_id ===
                            getValues("legal_form_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.legal_form_id && (
                    <Typography>{errors.legal_form_id.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Activité(s)
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("activite", {
                        onChange: (e) => setUpperCase("activite", e),
                      })}
                      id="activite"
                      name="activite"
                    />
                  ) : (
                    <Typography>{getValues("activite")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.activite && (
                    <Typography>{errors.activite.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Date de création
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_creation_company", {
                        onChange: (e) =>
                          setUpperCase("date_creation_company", e),
                      })}
                      id="date_creation_company"
                      name="date_creation_company"
                    />
                  ) : (
                    <Typography>
                      {convertDateFormat(
                        getValues("date_creation_company") || ""
                      )}
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_creation_company && (
                    <Typography>
                      {errors.date_creation_company.message}
                    </Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>SIRET</Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("siret", {
                        onChange: (e) => setUpperCase("siret", e),
                      })}
                      id="siret"
                      name="siret"
                    />
                  ) : (
                    <Typography>{getValues("siret")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.siret && (
                    <Typography>{errors.siret.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Activité Principale Exercée (APE)
                  </Typography>

                  <Typography>
                    {(() => {
                      const matchedAPE = codeAPEList.find(
                        (codeAPE) =>
                          codeAPE["Code APE"] === getValues("code_ape")
                      );

                      return matchedAPE
                        ? `${matchedAPE["Code APE"]} - ${matchedAPE[" Intitulés de la NAF"]}`
                        : "";
                    })()}
                  </Typography>
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.code_ape && (
                    <Typography>{errors.code_ape.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Secteur d'activité
                  </Typography>
                  {editable && !isLoadingSecteursActivites && secteursActivites.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("secteur_activite_id")}
                          name="secteur_activite_id"
                          id="secteur_activite_id"
                          defaultValue={tiersInfos.secteur_activite_id || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {secteursActivites.map((data) => (
                            <MenuItem
                              key={data.secteur_activite_id}
                              value={data.secteur_activite_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#secteurs-activites",
                            "_blank"
                          )
                        }
                      >
                        <AddIcon fontSize="large" />
                      </IconButton>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["legal_forms"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        secteursActivites.find(
                          (secteurActivite) =>
                            secteurActivite.secteur_activite_id ===
                            getValues("secteur_activite_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.secteur_activite_id && (
                    <Typography>{errors.secteur_activite_id.message}</Typography>
                  )}
                </Box>
              </Box>

              {editable ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                        N° Voie
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        {...register("num_voie")}
                        id="num_voie"
                        name="num_voie"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.num_voie && (
                        <Typography>{errors.num_voie.message}</Typography>
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
                        Type Voie
                      </Typography>
                      <TextField
                        fullWidth
                        {...register("typ_voie", {
                          onChange: (e) => setUpperCase("typ_voie", e),
                        })}
                        id="typ_voie"
                        name="typ_voie"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.typ_voie && (
                        <Typography>{errors.typ_voie.message}</Typography>
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
                        Intitulé Voie
                      </Typography>
                      <TextField
                        fullWidth
                        {...register("int_voie", {
                          onChange: (e) => setUpperCase("int_voie", e),
                        })}
                        id="int_voie"
                        name="int_voie"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.int_voie && (
                        <Typography>{errors.int_voie.message}</Typography>
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
                        Complément Voie
                      </Typography>
                      <TextField
                        fullWidth
                        {...register("complement_voie", {
                          onChange: (e) => setUpperCase("complement_voie", e),
                        })}
                        id="complement_voie"
                        name="complement_voie"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.complement_voie && (
                        <Typography>
                          {errors.complement_voie.message}
                        </Typography>
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
                        Code postal
                      </Typography>
                      <TextField
                        fullWidth
                        {...register("code_postal", {
                          onChange: (e) => setUpperCase("code_postal", e),
                        })}
                        id="code_postal"
                        name="code_postal"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.code_postal && (
                        <Typography>{errors.code_postal.message}</Typography>
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
                      <Typography sx={{ fontWeight: "bold" }}>
                        Commune
                      </Typography>

                      <TextField
                        fullWidth
                        {...register("commune", {
                          onChange: (e) => setUpperCase("commune", e),
                        })}
                        id="commune"
                        name="commune"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.commune && (
                        <Typography>{errors.commune.message}</Typography>
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
                      <Typography sx={{ fontWeight: "bold" }}>Cedex</Typography>
                      <TextField
                        fullWidth
                        {...register("cedex", {
                          onChange: (e) => setUpperCase("cedex", e),
                        })}
                        id="cedex"
                        name="cedex"
                      />
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.cedex && (
                        <Typography>{errors.cedex.message}</Typography>
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
                      <Typography sx={{ fontWeight: "bold" }}>Pays</Typography>
                      <FormControl fullWidth>
                        <Select
                          {...register("pays", {
                            onChange: (e) => setUpperCase("pays", e),
                          })}
                          id="pays"
                          name="pays"
                          defaultValue={tiersInfos.pays || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {pays.map((option) => {
                            return (
                              <MenuItem
                                key={option.value}
                                value={option.label}
                                selected
                              >
                                {option.label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.pays && (
                        <Typography>{errors.pays.message}</Typography>
                      )}
                    </Box>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Adresse</Typography>
                    <Typography>
                      {getValues("num_voie")} {getValues("typ_voie")}{" "}
                      {getValues("int_voie")} {getValues("complement_voie")}{" "}
                      {getValues("code_postal")} {getValues("commune")}{" "}
                      {getValues("cedex")} {getValues("pays")}
                    </Typography>
                  </Box>
                  <Box
                    mt={1}
                    p={1}
                    color="red"
                    sx={{ minHeight: "36px" }}
                  ></Box>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold" }}>Email</Typography>
                  {editable ? (
                    <TextField fullWidth {...register("email")} />
                  ) : (
                    <Typography>{getValues("email")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.email && (
                    <Typography>{errors.email.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>Téléphone</Typography>
                  {editable ? (
                    <TextField fullWidth {...register("phone_number")} />
                  ) : (
                    <Typography>{getValues("phone_number")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.phone_number && (
                    <Typography>{errors.phone_number.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>QPV</Typography>
                  {editable ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("qpv")}
                        name="qpv"
                        id="qpv"
                        defaultValue={tiersInfos.qpv || ""}
                      >
                        <MenuItem key="" value="">
                          --------
                        </MenuItem>
                        <MenuItem key="Oui" value="Oui">
                          Oui
                        </MenuItem>
                        <MenuItem key="Non" value="Non">
                          Non
                        </MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>{getValues("qpv")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.qpv && <Typography>{errors.qpv.message}</Typography>}
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
                  <Typography sx={{ fontWeight: "bold" }}>ZFU</Typography>
                  {editable ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("zfu")}
                        name="zfu"
                        id="zfu"
                        defaultValue={tiersInfos.zfu || ""}
                      >
                        <MenuItem key="" value="">
                          --------
                        </MenuItem>
                        <MenuItem key="Oui" value="Oui">
                          Oui
                        </MenuItem>
                        <MenuItem key="Non" value="Non">
                          Non
                        </MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>{getValues("zfu")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.zfu && <Typography>{errors.zfu.message}</Typography>}
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Montant du capital
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="number"
                      {...register("capital_amount")}
                      id="capital_amount"
                      name="capital_amount"
                    />
                  ) : (
                    <Typography>{getValues("capital_amount")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.capital_amount && (
                    <Typography>{errors.capital_amount.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Date de fin d'exercice
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("date_end_exercise")}
                      id="date_end_exercise"
                      name="date_end_exercise"
                    />
                  ) : (
                    <Typography>{getValues("date_end_exercise")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_end_exercise && (
                    <Typography>{errors.date_end_exercise.message}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
