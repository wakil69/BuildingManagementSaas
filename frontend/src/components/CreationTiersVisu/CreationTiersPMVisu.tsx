import countryList from "react-select-country-list";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useBatiments } from "../../hooks/tiers/useBatiments";
import customRequest from "../../routes/api/api";
import { AddDirigeantType, CreatePM } from "../../types/tiers/tiers";
import { useLegalForms } from "../../hooks/tiers/useLegalForms";
import { useFormulesTypes } from "../../hooks/tiers/useFormules";
import { useAllPPs } from "../../hooks/useAllPPs/useAllPPs";
import { useDebounce } from "use-debounce";
import { useRelationsPMPP } from "../../hooks/tiers/useRelations";
import { SearchPP } from "../../types/types";
import CloseIcon from "@mui/icons-material/Close";
import { useSecteursActivites } from "../../hooks/tiers/useSecteursActivites";

type FieldName = keyof Yup.InferType<typeof validationSchemaPMInfos>;

const validationSchemaPMInfos = Yup.object().shape({
  batiment_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .required("Le bâtiment est requis."),
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
  formule_id: Yup.number().required("La formule est requise."),
  date_debut_formule: Yup.string().required("La date de début est requise."),
  date_fin_formule: Yup.string().nullable(),
  relations: Yup.array()
    .of(
      Yup.object().shape({
        tiepp_id: Yup.number().required("La personne physique est requise."),
        rel_typ_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez choisir le type de la relation.")
          .nullable()
          .optional(),
        relation_date_debut: Yup.string().nullable(),
        relation_date_fin: Yup.string().nullable(),
        libelle: Yup.string().required(
          "Chaque dirigeant doit avoir un ID valide."
        ),
      })
    )
    .min(1, "Il faut au moins un dirigeant.")
    .required("Les dirigeants sont requis."),
});

export default function CreationTiersPMVisu() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pays = useMemo(() => countryList().getData(), []);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const { secteursActivites, isLoadingSecteursActivites } = useSecteursActivites();
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();
  const { relationsPMPP, isLoadingRelationsPMPP } = useRelationsPMPP();
  const [searchPP, setSearchPP] = useState("");
  const [debouncedSearchPP] = useDebounce(searchPP, 500);
  const { allPPs, isLoadingAllPPs } = useAllPPs(debouncedSearchPP);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaPMInfos),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "relations",
  });

  const tiersSave = async (data: CreatePM) => {
    try {
      setMessage("");

      const response = await customRequest.post(`/tiers/create-pm`, data);

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
    mutationFn: (data: CreatePM) => tiersSave(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/tiers/recherche/visualisation/PM/${data.id}`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreatePM) => {
    tiersSaveMutation.mutate(data);
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

  const handleSelect = (pp: SearchPP) => {
    setSearchPP(pp.libelle);
    append({ tiepp_id: pp.tiepp_id, libelle: pp.libelle });
    setIsSearchActive(false);
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
        <Typography variant="h6">Personne Morale</Typography>
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
            style={{ overflow: "hidden", padding: 3 }}
          >
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Informations générales</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  marginY: 3,
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
                    <Typography sx={{ fontWeight: "bold" }}>
                      Bâtiment*
                    </Typography>
                    {!isLoadingBatiments ? (
                      <FormControl fullWidth>
                        <Select
                          {...register("batiment_id", {
                            onChange: (e) => {
                              setValue("batiment_id", e.target.value);
                            },
                          })}
                          name="batiment"
                          id="batiment"
                          defaultValue={batiments[0].batiment_id}
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
                    ) : null}
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
                      Dénomination entreprise*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("raison_sociale", {
                        onChange: (e) => setUpperCase("raison_sociale", e),
                      })}
                      id="raison_sociale"
                      name="raison_sociale"
                    />
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
                    <TextField
                      fullWidth
                      {...register("sigle", {
                        onChange: (e) => setUpperCase("sigle", e),
                      })}
                      id="sigle"
                      name="sigle"
                    />
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
                    {!isLoadingLegalForms && legalForms.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("legal_form_id")}
                            name="legal_form_id"
                            id="legal_form_id"
                            defaultValue={""}
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
                    ) : null}
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
                    <TextField
                      fullWidth
                      {...register("activite", {
                        onChange: (e) => setUpperCase("activite", e),
                      })}
                      id="activite"
                      name="activite"
                    />
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
                    <TextField
                      fullWidth
                      {...register("siret", {
                        onChange: (e) => setUpperCase("siret", e),
                      })}
                      id="siret"
                      name="siret"
                    />
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
                      Secteur d'activité
                    </Typography>
                    {!isLoadingSecteursActivites && secteursActivites.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("secteur_activite_id")}
                            name="secteur_activite_id"
                            id="secteur_activite_id"
                            defaultValue={""}
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
                              queryKey: ["secteurs_activites"],
                            })
                          }
                        >
                          <LoopIcon fontSize="large" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.secteur_activite_id && (
                      <Typography>{errors.secteur_activite_id.message}</Typography>
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
                      <Typography>{errors.complement_voie.message}</Typography>
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
                    <Typography sx={{ fontWeight: "bold" }}>Commune</Typography>

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
                        defaultValue={"France"}
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

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Email</Typography>
                    <TextField fullWidth {...register("email")} />
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
                    <Typography sx={{ fontWeight: "bold" }}>
                      Téléphone
                    </Typography>
                    <TextField fullWidth {...register("phone_number")} />
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
                    <FormControl fullWidth>
                      <Select
                        {...register("qpv")}
                        name="qpv"
                        id="qpv"
                        defaultValue={""}
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
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.qpv && (
                      <Typography>{errors.qpv.message}</Typography>
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
                    <Typography sx={{ fontWeight: "bold" }}>ZFU</Typography>
                    <FormControl fullWidth>
                      <Select
                        {...register("zfu")}
                        name="zfu"
                        id="zfu"
                        defaultValue={""}
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
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.zfu && (
                      <Typography>{errors.zfu.message}</Typography>
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
                      Montant du capital
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      {...register("capital_amount")}
                    />
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
                    <TextField fullWidth {...register("date_end_exercise")} />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_end_exercise && (
                      <Typography>
                        {errors.date_end_exercise.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Dirigeants</Typography>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginY: 3,
                }}
              >
                <TextField
                  type="text"
                  value={searchPP}
                  onChange={(e) => setSearchPP(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  onBlur={() => setIsSearchActive(false)}
                  placeholder="Nom de la personne physique"
                  variant="outlined"
                  fullWidth
                  sx={{
                    width: "60%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                    },
                  }}
                />
                {isSearchActive && allPPs.length && searchPP.trim() ? (
                  <Paper
                    elevation={3}
                    sx={{
                      position: "absolute",
                      bottom: "100%",
                      marginTop: 2,
                      width: "60%",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 20,
                      borderRadius: "8px",
                    }}
                  >
                    <List>
                      {!isLoadingAllPPs &&
                        allPPs
                          .filter(
                            (pp) =>
                              !fields.some(
                                (relation) =>
                                  pp.tiepp_id ===
                                  (relation as AddDirigeantType).tiepp_id
                              )
                          )
                          .map((pp) => (
                            <ListItem
                              key={pp.tiepp_id}
                              disablePadding
                              sx={{
                                "&:hover": {
                                  backgroundColor: "#f1f1f1",
                                },
                              }}
                            >
                              <ListItemButton
                                onMouseDown={() => handleSelect(pp)}
                              >
                                {pp.libelle}
                              </ListItemButton>
                            </ListItem>
                          ))}
                    </List>
                  </Paper>
                ) : null}
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Libellé</TableCell>
                        <TableCell align="center">Type</TableCell>
                        <TableCell align="center">Date de Début</TableCell>
                        <TableCell align="center">Date de Fin</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((dirigeant, index) => (
                        <TableRow key={dirigeant.tiepp_id}>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Typography>{dirigeant.libelle}</Typography>
                              <Box
                                mt={1}
                                p={1}
                                color="red"
                                sx={{ minHeight: "36px" }}
                              ></Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Select
                                {...register(`relations.${index}.rel_typ_id`)}
                                defaultValue={""}
                              >
                                <MenuItem key="" value="">
                                  ------
                                </MenuItem>
                                {!isLoadingRelationsPMPP && relationsPMPP.length
                                  ? relationsPMPP.map((data) => (
                                      <MenuItem
                                        key={data.rel_typ_id}
                                        value={data.rel_typ_id}
                                      >
                                        {data.name}
                                      </MenuItem>
                                    ))
                                  : null}
                              </Select>
                              <Box
                                mt={1}
                                p={1}
                                color="red"
                                sx={{ minHeight: "36px" }}
                              >
                                {errors.relations &&
                                  errors.relations[index] &&
                                  errors.relations[index].rel_typ_id && (
                                    <Typography>
                                      {
                                        errors.relations[index]?.rel_typ_id
                                          .message
                                      }
                                    </Typography>
                                  )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <TextField
                                fullWidth
                                type="date"
                                {...register(
                                  `relations.${index}.relation_date_debut`
                                )}
                              />
                              <Box
                                mt={1}
                                p={1}
                                color="red"
                                sx={{ minHeight: "36px" }}
                              >
                                {errors.relations &&
                                  errors.relations[index] &&
                                  errors.relations[index]
                                    .relation_date_debut && (
                                    <Typography>
                                      {
                                        errors.relations[index]
                                          .relation_date_debut.message
                                      }
                                    </Typography>
                                  )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <TextField
                                fullWidth
                                type="date"
                                {...register(
                                  `relations.${index}.relation_date_fin`
                                )}
                              />
                              <Box
                                mt={1}
                                p={1}
                                color="red"
                                sx={{ minHeight: "36px" }}
                              >
                                {errors.relations &&
                                  errors.relations[index] &&
                                  errors.relations[index].relation_date_fin && (
                                    <Typography>
                                      {
                                        errors.relations[index]
                                          .relation_date_fin.message
                                      }
                                    </Typography>
                                  )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <IconButton onClick={() => remove(index)}>
                                <CloseIcon sx={{ color: "red" }} />
                              </IconButton>
                              <Box
                                mt={1}
                                p={1}
                                color="red"
                                sx={{ minHeight: "36px" }}
                              >
                                {errors.relations &&
                                  errors.relations[index] &&
                                  errors.relations[index].rel_typ_id && (
                                    <Typography>
                                      {
                                        errors.relations[index]?.rel_typ_id
                                          .message
                                      }
                                    </Typography>
                                  )}
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">
                Formule de la personne morale
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  marginY: 3,
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
                    <Typography sx={{ fontWeight: "bold" }}>
                      Formule*
                    </Typography>
                    {!isLoadingFormulesTypes && formulesTypes.length ? (
                      <FormControl fullWidth>
                        <Select
                          {...register("formule_id")}
                          name="formule_id"
                          id="formule_id"
                          defaultValue={formulesTypes[0].formule_id}
                        >
                          {formulesTypes.map((data) => (
                            <MenuItem
                              key={data.formule_id}
                              value={data.formule_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <CircularProgress />
                    )}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.formule_id && (
                      <Typography>{errors.formule_id.message}</Typography>
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
                      Date de début*
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_debut_formule")}
                      id="date_debut_formule"
                      name="date_debut_formule"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_debut_formule && (
                      <Typography>
                        {errors.date_debut_formule.message}
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
                      Date de fin
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_fin_formule")}
                      id="date_fin_formule"
                      name="date_fin_formule"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_fin_formule && (
                      <Typography>{errors.date_fin_formule.message}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
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
                Ajouter la personne physique
              </Button>
              {tiersSaveMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {tiersSaveMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
