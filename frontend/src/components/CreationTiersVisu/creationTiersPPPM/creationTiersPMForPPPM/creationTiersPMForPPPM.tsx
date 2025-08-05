import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { CreatePPPM } from "../../../../types/tiers/tiers";
import {
  Box,
  CircularProgress,
  FormControl,
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
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useBatiments } from "../../../../hooks/tiers/useBatiments";
import { useLegalForms } from "../../../../hooks/tiers/useLegalForms";
import { useFormulesTypes } from "../../../../hooks/tiers/useFormules";
import { useRelationsPMPP } from "../../../../hooks/tiers/useRelations";
import countryList from "react-select-country-list";
import { useQueryClient } from "@tanstack/react-query";
import { useSecteursActivites } from "../../../../hooks/tiers/useSecteursActivites";

type FieldName =
  | "pm.raison_sociale"
  | "pm.int_voie"
  | "pm.num_voie"
  | "pm.typ_voie"
  | "pm.complement_voie"
  | "pm.pays"
  | "pm.commune"
  | "pm.cedex"
  | "pm.code_postal"
  | "pm.sigle"
  | "pm.siret"
  | "pm.activite";

export default function CreationTiersPMForPPPM({
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
  const [isOpenPM, setIsOpenPM] = useState(true);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const { secteursActivites, isLoadingSecteursActivites } = useSecteursActivites();
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();
  const { relationsPMPP, isLoadingRelationsPMPP } = useRelationsPMPP();
  const pays = useMemo(() => countryList().getData(), []);
  const queryClient = useQueryClient();

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || "");
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
        onClick={() => setIsOpenPM(!isOpenPM)}
      >
        <Typography variant="h6">Personne Morale</Typography>
        <motion.div
          animate={{ rotate: isOpenPM ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpenPM && (
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
                          {...register("pm.batiment_id", {
                            onChange: (e) => {
                              setValue("pm.batiment_id", e.target.value);
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
                    {errors.pm && errors.pm.batiment_id && (
                      <Typography>{errors.pm.batiment_id.message}</Typography>
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
                      {...register("pm.raison_sociale", {
                        onChange: (e) => setUpperCase("pm.raison_sociale", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.raison_sociale && (
                      <Typography>
                        {errors.pm.raison_sociale.message}
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
                    <Typography sx={{ fontWeight: "bold" }}>Sigle</Typography>
                    <TextField
                      fullWidth
                      {...register("pm.sigle", {
                        onChange: (e) => setUpperCase("pm.sigle", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.sigle && (
                      <Typography>{errors.pm.sigle.message}</Typography>
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
                            {...register("pm.legal_form_id")}
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
                    {errors.pm && errors.pm.legal_form_id && (
                      <Typography>{errors.pm.legal_form_id.message}</Typography>
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
                      {...register("pm.activite", {
                        onChange: (e) => setUpperCase("pm.activite", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.activite && (
                      <Typography>{errors.pm.activite.message}</Typography>
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
                      {...register("pm.date_creation_company")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.date_creation_company && (
                      <Typography>
                        {errors.pm.date_creation_company.message}
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
                      {...register("pm.siret", {
                        onChange: (e) => setUpperCase("pm.siret", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.siret && (
                      <Typography>{errors.pm.siret.message}</Typography>
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
                            {...register("pm.secteur_activite_id")}
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
                    {errors.pm && errors.pm.secteur_activite_id && (
                      <Typography>{errors.pm.secteur_activite_id.message}</Typography>
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
                      {...register("pm.num_voie")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.num_voie && (
                      <Typography>{errors.pm.num_voie.message}</Typography>
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
                      {...register("pm.typ_voie", {
                        onChange: (e) => setUpperCase("pm.typ_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.typ_voie && (
                      <Typography>{errors.pm.typ_voie.message}</Typography>
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
                      {...register("pm.int_voie", {
                        onChange: (e) => setUpperCase("pm.int_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.int_voie && (
                      <Typography>{errors.pm.int_voie.message}</Typography>
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
                      {...register("pm.complement_voie", {
                        onChange: (e) => setUpperCase("pm.complement_voie", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.complement_voie && (
                      <Typography>
                        {errors.pm.complement_voie.message}
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
                      {...register("pm.code_postal", {
                        onChange: (e) => setUpperCase("pm.code_postal", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.code_postal && (
                      <Typography>{errors.pm.code_postal.message}</Typography>
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
                      {...register("pm.commune", {
                        onChange: (e) => setUpperCase("pm.commune", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.commune && (
                      <Typography>{errors.pm.commune.message}</Typography>
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
                      {...register("pm.cedex", {
                        onChange: (e) => setUpperCase("pm.cedex", e),
                      })}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.cedex && (
                      <Typography>{errors.pm.cedex.message}</Typography>
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
                        {...register("pm.pays", {
                          onChange: (e) => setUpperCase("pm.pays", e),
                        })}
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
                    {errors.pm && errors.pm.pays && (
                      <Typography>{errors.pm.pays.message}</Typography>
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
                    <TextField fullWidth {...register("pm.email")} />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.email && (
                      <Typography>{errors.pm.email.message}</Typography>
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
                    <TextField fullWidth {...register("pm.phone_number")} />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.phone_number && (
                      <Typography>{errors.pm.phone_number.message}</Typography>
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
                      <Select {...register("pm.qpv")} defaultValue={""}>
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
                    {errors.pm && errors.pm.qpv && (
                      <Typography>{errors.pm.qpv.message}</Typography>
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
                      <Select {...register("pm.zfu")} defaultValue={""}>
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
                    {errors.pm && errors.pm.zfu && (
                      <Typography>{errors.pm.zfu.message}</Typography>
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
                      {...register("pm.capital_amount")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.capital_amount && (
                      <Typography>
                        {errors.pm.capital_amount.message}
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
                    <Typography sx={{ fontWeight: "bold" }}>
                      Date de fin d'exercice
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("pm.date_end_exercise")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.date_end_exercise && (
                      <Typography>
                        {errors.pm.date_end_exercise.message}
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
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Libellé</TableCell>
                        <TableCell align="center">Type</TableCell>
                        <TableCell align="center">Date de Début</TableCell>
                        <TableCell align="center">Date de Fin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Typography>
                              {getValues("pp.first_name")}{" "}
                              {getValues("pp.surname")}
                            </Typography>
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
                              {...register(`pm.rel_typ_id`)}
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
                              {errors.pm && errors.pm.rel_typ_id && (
                                <Typography>
                                  {errors.pm.rel_typ_id.message}
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
                              {...register(`pm.relation_date_debut`)}
                            />
                            <Box
                              mt={1}
                              p={1}
                              color="red"
                              sx={{ minHeight: "36px" }}
                            >
                              {errors.pm && errors.pm.relation_date_debut && (
                                <Typography>
                                  {errors.pm.relation_date_debut.message}
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
                              {...register(`pm.relation_date_fin`)}
                            />
                            <Box
                              mt={1}
                              p={1}
                              color="red"
                              sx={{ minHeight: "36px" }}
                            >
                              {errors.pm && errors.pm.relation_date_fin && (
                                <Typography>
                                  {errors.pm.relation_date_fin.message}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
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
                          {...register("pm.formule_id")}
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
                    {errors.pm && errors.pm.formule_id && (
                      <Typography>{errors.pm.formule_id.message}</Typography>
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
                      {...register("pm.date_debut_formule")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.date_debut_formule && (
                      <Typography>
                        {errors.pm.date_debut_formule.message}
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
                      {...register("pm.date_fin_formule")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.pm && errors.pm.date_fin_formule && (
                      <Typography>
                        {errors.pm.date_fin_formule.message}
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
