import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
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
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useBatiments } from "../../../../hooks/tiers/useBatiments";
import { usePrescriber } from "../../../../hooks/tiers/usePrescriber";
import { useSituationSocioPro } from "../../../../hooks/tiers/useSituationSocioPro";
import { useStudyLevels } from "../../../../hooks/tiers/useStudyLevels";
import { useSituationAvPrj } from "../../../../hooks/tiers/useSituationAvPrj";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UseFormRegister,
  UseFormGetValues,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { CreatePPPM } from "../../../../types/tiers/tiers";
import customRequest from "../../../../routes/api/api";
import countryList from "react-select-country-list";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { useLegalForms } from "../../../../hooks/tiers/useLegalForms";
import { useFormulesTypes } from "../../../../hooks/tiers/useFormules";

type FieldName =
  | "pp.first_name"
  | "pp.surname"
  | "pp.int_voie"
  | "pp.num_voie"
  | "pp.typ_voie"
  | "pp.complement_voie"
  | "pp.pays"
  | "pp.commune"
  | "pp.cedex"
  | "pp.code_postal"
  | "pp.birth_name"
  | "pp.raison_social_prj"
  | "pp.activite_prj";

export default function CreationTiersPPForPPPM({
  register,
  setValue,
  errors,
  getValues,
}: {
  register: UseFormRegister<CreatePPPM>;
  setValue: UseFormSetValue<CreatePPPM>;
  errors: FieldErrors<CreatePPPM>;
  getValues: UseFormGetValues<CreatePPPM>;
}) {
  const [isOpenPP, setIsOpenPP] = useState(true);
  const { studyLevels, isLoadingStudyLevels } = useStudyLevels();
  const { situationAvPrj, isLoadingSituationAvPrj } = useSituationAvPrj();
  const { situationSocioPro, isLoadingSituationSocioPro } =
    useSituationSocioPro();
  const { prescribers, isLoadingPrescriber } = usePrescriber();
  const { batiments, isLoadingBatiments } = useBatiments();
  const pays = useMemo(() => countryList().getData(), []);
  const queryClient = useQueryClient();
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || "");
  };

  async function getSurfacesWishes(): Promise<Record<string, boolean>> {
    try {
      const response = await customRequest.get("/admin/surfaces", {
        params: { batiment_id: getValues("pp.batiment_id") },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      let data: number[] = response.data;

      const surfaceWishes: Record<string, boolean> = data.reduce(
        (acc: Record<string, boolean>, cur: number) => {
          acc[cur] = false;
          return acc;
        },
        {}
      );

      setValue(`pp.surface_wishes`, surfaceWishes);

      return surfaceWishes;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: surfaceWishes } = useQuery<Record<string, boolean>>({
    queryKey: ["surfaces_wishes", getValues("pp.batiment_id")],
    queryFn: getSurfacesWishes,
    refetchOnWindowFocus: false,
    enabled: !!getValues("pp.batiment_id"),
  });

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
        onClick={() => setIsOpenPP(!isOpenPP)}
      >
        <Typography variant="h6">Personne Physique</Typography>
        <motion.div
          animate={{ rotate: isOpenPP ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpenPP && (
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Bâtiment*
                    </Typography>
                    {!isLoadingBatiments ? (
                      <FormControl fullWidth>
                        <Select
                          {...register("pp.batiment_id", {
                            onChange: (e) => {
                              setValue("pp.batiment_id", e.target.value);
                            },
                          })}
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
                    {errors.pp && errors.pp.batiment_id && (
                      <Typography>{errors.pp.batiment_id.message}</Typography>
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
                      Civilité
                    </Typography>
                    <Select {...register("pp.civilite")} defaultValue={""}>
                      <MenuItem key="" value="">
                        --------
                      </MenuItem>
                      <MenuItem key="Mr" value="Mr">
                        Mr
                      </MenuItem>
                      <MenuItem key="Mme" value="Mme">
                        Mme
                      </MenuItem>
                    </Select>
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.civilite && (
                      <Typography>{errors.pp.civilite.message}</Typography>
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
                    <TextField
                      fullWidth
                      {...register("pp.first_name", {
                        onChange: (e) => setUpperCase("pp.first_name", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.first_name && (
                      <Typography>{errors.pp.first_name.message}</Typography>
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
                      Nom*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pp.surname", {
                        onChange: (e) => setUpperCase("pp.surname", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.surname && (
                      <Typography>{errors.pp.surname.message}</Typography>
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
                      Nom de naissance
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pp.birth_name", {
                        onChange: (e) => setUpperCase("pp.birth_name", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.birth_name && (
                      <Typography>{errors.pp.birth_name.message}</Typography>
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
                      Date de naissance
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("pp.birth_date")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.birth_date && (
                      <Typography>{errors.pp.birth_date.message}</Typography>
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
                    <TextField fullWidth {...register("pp.email")} />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.email && (
                      <Typography>{errors.pp.email.message}</Typography>
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
                      Téléphone
                    </Typography>
                    <TextField fullWidth {...register("pp.phone_number")} />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.phone_number && (
                      <Typography>{errors.pp.phone_number.message}</Typography>
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
                      {...register("pp.num_voie")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.num_voie && (
                      <Typography>{errors.pp.num_voie.message}</Typography>
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
                      {...register("pp.typ_voie", {
                        onChange: (e) => setUpperCase("pp.typ_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.typ_voie && (
                      <Typography>{errors.pp.typ_voie.message}</Typography>
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
                      {...register("pp.int_voie", {
                        onChange: (e) => setUpperCase("pp.int_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.int_voie && (
                      <Typography>{errors.pp.int_voie.message}</Typography>
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
                      {...register("pp.complement_voie", {
                        onChange: (e) => setUpperCase("pp.complement_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.complement_voie && (
                      <Typography>
                        {errors.pp.complement_voie.message}
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
                      {...register("pp.code_postal", {
                        onChange: (e) => setUpperCase("pp.code_postal", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.code_postal && (
                      <Typography>{errors.pp.code_postal.message}</Typography>
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
                      Commune
                    </Typography>

                    <TextField
                      fullWidth
                      {...register("pp.commune", {
                        onChange: (e) => setUpperCase("pp.commune", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.commune && (
                      <Typography>{errors.pp.commune.message}</Typography>
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
                      Cedex
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pp.cedex", {
                        onChange: (e) => setUpperCase("pp.cedex", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.cedex && (
                      <Typography>{errors.pp.cedex.message}</Typography>
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
                      Pays
                    </Typography>
                    <FormControl fullWidth>
                      <Select {...register("pp.pays")} defaultValue={"France"}>
                        <MenuItem key="" value="" selected>
                          --------
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
                    {errors.pp && errors.pp.pays && (
                      <Typography>{errors.pp.pays.message}</Typography>
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
                      QPV
                    </Typography>
                    <Select {...register("pp.qpv")} defaultValue={""}>
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
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.qpv && (
                      <Typography>{errors.pp.qpv.message}</Typography>
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
                      ZFU
                    </Typography>
                    <Select {...register("pp.zfu")} defaultValue={""}>
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
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.zfu && (
                      <Typography>{errors.pp.zfu.message}</Typography>
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
                      Niveau d'étude
                    </Typography>
                    {!isLoadingStudyLevels && studyLevels.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("pp.study_level_id")}
                            defaultValue={""}
                          >
                            <MenuItem key="" value="">
                              -------
                            </MenuItem>
                            {studyLevels.map((data) => (
                              <MenuItem
                                key={data.study_level_id}
                                value={data.study_level_id}
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
                              "/pageConnecte/administration/reglages#study-levels",
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
                              queryKey: ["study_levels"],
                            })
                          }
                        >
                          <LoopIcon fontSize="large" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.study_level_id && (
                      <Typography>
                        {errors.pp.study_level_id.message}
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
                      Situation avant projet
                    </Typography>
                    {!isLoadingSituationAvPrj && situationAvPrj.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Select
                          {...register("pp.situation_before_prj_id")}
                          defaultValue={""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {situationAvPrj.map((data) => (
                            <MenuItem
                              key={data.situation_before_prj_id}
                              value={data.situation_before_prj_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>

                        <IconButton
                          aria-label="edit"
                          onClick={() =>
                            window.open(
                              "/pageConnecte/administration/reglages#situation-avant-prj",
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
                              queryKey: ["situation_avant_projet"],
                            })
                          }
                        >
                          <LoopIcon fontSize="large" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.situation_before_prj_id && (
                      <Typography>
                        {errors.pp.situation_before_prj_id.message}
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
                      Expérience professionnelle
                    </Typography>
                    {!isLoadingSituationSocioPro && situationSocioPro.length ? (
                      <Select
                        {...register("pp.situation_socio_pro_id")}
                        defaultValue={""}
                      >
                        <MenuItem key="" value="">
                          --------
                        </MenuItem>
                        {situationSocioPro.map((data, idx) => {
                          if (idx != 0) {
                            return (
                              <MenuItem
                                key={data["Liste PCS-ESE"]}
                                value={data["Liste PCS-ESE"]}
                              >
                                {data["Liste PCS-ESE"]} -{" "}
                                {
                                  data[
                                    "Liste des professions et catégories socioprofessionnelles des emplois salariés des employeurs privés et publics"
                                  ]
                                }
                              </MenuItem>
                            );
                          }
                          return null;
                        })}
                      </Select>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.situation_socio_pro_id && (
                      <Typography>
                        {errors.pp.situation_socio_pro_id.message}
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
                      Autorisation droit à l'image
                    </Typography>

                    <Select
                      {...register("pp.image_authorisation")}
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
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.image_authorisation && (
                      <Typography>
                        {errors.pp.image_authorisation.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Informations sur le projet</Typography>
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Dénomination entreprise
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pp.raison_social_prj", {
                        onChange: (e) =>
                          setUpperCase("pp.raison_social_prj", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.raison_social_prj && (
                      <Typography>
                        {errors.pp.raison_social_prj.message}
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
                      Activité*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pp.activite_prj", {
                        onChange: (e) => setUpperCase("pp.activite_prj", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.activite_prj && (
                      <Typography>{errors.pp.activite_prj.message}</Typography>
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
                      Statut juridique
                    </Typography>
                    {!isLoadingLegalForms && legalForms.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("pp.legal_form_id")}
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
                    {errors.pp && errors.pp.legal_form_id && (
                      <Typography>{errors.pp.legal_form_id.message}</Typography>
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
                      Date de création
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("pp.date_debut_prj")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.date_debut_prj && (
                      <Typography>
                        {errors.pp.date_debut_prj.message}
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
                      Nombre de dirigeants
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      min={0}
                      {...register("pp.nb_dirigeants_prj")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.nb_dirigeants_prj && (
                      <Typography>
                        {errors.pp.nb_dirigeants_prj.message}
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
                      Effectif prévisionnel
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      min={0}
                      {...register("pp.effectif_prj")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.effectif_prj && (
                      <Typography>{errors.pp.effectif_prj.message}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Premier entretien</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 3,
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Date de premier entretien
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      {...register("pp.first_meeting_date")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.first_meeting_date && (
                      <Typography>
                        {errors.pp.first_meeting_date.message}
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
                      Heure de début
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="HH:MM"
                      {...register("pp.first_meeting_hour_begin")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.first_meeting_hour_begin && (
                      <Typography>
                        {errors.pp.first_meeting_hour_begin.message}
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
                      Heure de fin
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="HH:MM"
                      {...register("pp.first_meeting_hour_end")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.first_meeting_hour_end && (
                      <Typography>
                        {errors.pp.first_meeting_hour_end.message}
                      </Typography>
                    )}
                  </Box>
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
                    Prescripteur
                  </Typography>
                  {!isLoadingPrescriber && prescribers.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("pp.prescriber_id")}
                          defaultValue={""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {prescribers.map((data) => (
                            <MenuItem
                              key={data.prescriber_id}
                              value={data.prescriber_id}
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
                            "/pageConnecte/administration/reglages#prescribers",
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
                            queryKey: ["prescribers"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.pp && errors.pp.prescriber_id && (
                    <Typography>{errors.pp.prescriber_id.message}</Typography>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    width: "80%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Commentaire
                  </Typography>
                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    {...register("pp.first_meeting_feedback")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.pp && errors.pp.first_meeting_feedback && (
                    <Typography>
                      {errors.pp.first_meeting_feedback.message}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Accompagnement souhaité</Typography>
              <TableContainer>
                <Table>
                  <TableHead></TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        sx={{ width: "30%", fontWeight: "bold" }}
                      >
                        Formule(s) souhaitée(s)
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("pp.formule_wishes.Bureau", {
                                onChange: (e) => {
                                  setValue(
                                    `pp.formule_wishes.Bureau`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Bureau"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("pp.formule_wishes.Bureau Partagé", {
                                onChange: (e) => {
                                  setValue(
                                    `pp.formule_wishes.Bureau Partagé`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Bureau Partagé"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("pp.formule_wishes.Extra-Muros", {
                                onChange: (e) => {
                                  setValue(
                                    `pp.formule_wishes.Extra-Muros`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Extra-Muros"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("pp.formule_wishes.Coworking", {
                                onChange: (e) => {
                                  setValue(
                                    `pp.formule_wishes.Coworking`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Coworking"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    {surfaceWishes &&
                      Object.entries(surfaceWishes)
                        .reduce((rows: any[], [size, value], index) => {
                          if (index % 4 === 0) rows.push([]);
                          rows[rows.length - 1].push({ size, value });
                          return rows;
                        }, [])
                        .map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {rowIndex === 0 && (
                              <TableCell
                                rowSpan={Math.ceil(
                                  Object.keys(surfaceWishes).length / 4
                                )}
                                sx={{ width: "20%", fontWeight: "bold" }}
                              >
                                Superficie
                              </TableCell>
                            )}
                            {row.map(({ size }: any) => (
                              <TableCell key={size} sx={{ width: "20%" }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      // checked={surfaceWishes[size]}
                                      // onChange={(e) => {
                                      //   setValue(
                                      //     `surface_wishes.${size}`,
                                      //     e.target.checked
                                      //   );
                                      // }}
                                      {...register(
                                        `pp.surface_wishes.${size}` as any
                                      )}
                                    />
                                  }
                                  label={`${size} m²`}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}

                    <TableRow>
                      <TableCell
                        sx={{
                          width: "30%",
                          height: "6rem",
                          fontWeight: "bold",
                        }}
                      >
                        Date prévisionnelle d'entrée
                      </TableCell>
                      <TableCell colSpan={2}>
                        <TextField
                          type="date"
                          {...register("pp.date_entree_wished")}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">
                Formule de la personne physique
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
                          {...register("pp.formule_id")}
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
                    {errors.pp && errors.pp.formule_id && (
                      <Typography>{errors.pp.formule_id.message}</Typography>
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
                      {...register("pp.date_debut_formule")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.date_debut_formule && (
                      <Typography>
                        {errors.pp.date_debut_formule.message}
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
                      {...register("pp.date_fin_formule")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pp && errors.pp.date_fin_formule && (
                      <Typography>
                        {errors.pp.date_fin_formule.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
