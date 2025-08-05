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
import { PPInfos } from "../../../types/tiers/tiers";
import { useBatiments } from "../../../hooks/tiers/useBatiments";
import { useStudyLevels } from "../../../hooks/tiers/useStudyLevels";
import { useSituationAvPrj } from "../../../hooks/tiers/useSituationAvPrj";
import { useSituationSocioPro } from "../../../hooks/tiers/useSituationSocioPro";
import { convertDateFormat } from "../../../utils/functions";

type FieldName = keyof Yup.InferType<typeof validationSchemaPPInfos>;

const validationSchemaPPInfos = Yup.object().shape({
  batiment_id: Yup.number().required("Le bâtiment est requis."),
  civilite: Yup.string()
    .oneOf(["Mr", "Mme", ""], "Veuillez choisir une des options.")
    .nullable(),
  surname: Yup.string().required("L'intitulé est requis."),
  first_name: Yup.string().required("Le prénom est requis."),
  birth_date: Yup.string().nullable(),
  birth_name: Yup.string().nullable(),
  email: Yup.string().required("L'email est requis."),
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
  study_level_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  situation_before_prj_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  situation_socio_pro_id: Yup.string().nullable(),
  image_authorisation: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
});

export default function InfosPPVisu({
  tiersInfos,
  id,
}: {
  tiersInfos: PPInfos;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const pays = useMemo(() => countryList().getData(), []);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { studyLevels, isLoadingStudyLevels } = useStudyLevels();
  const { situationAvPrj, isLoadingSituationAvPrj } = useSituationAvPrj();
  const { situationSocioPro, isLoadingSituationSocioPro } =
    useSituationSocioPro();

  const {
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaPPInfos),
    defaultValues: tiersInfos,
  });

  const tiersUpdate = async (data: PPInfos) => {
    try {
      setMessage("");
      const response = await customRequest.put(
        `/tiers/infos-gen/PP/${id}`,
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
    mutationFn: (data: PPInfos) => tiersUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["tiers", "PP", id],
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: PPInfos) => {
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
                  <Typography sx={{ fontWeight: "bold" }}>Civilité</Typography>
                  {editable ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("civilite")}
                        name="civilite"
                        id="civilite"
                        defaultValue={tiersInfos.civilite || ""}
                      >
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
                    </FormControl>
                  ) : (
                    <Typography>{getValues("civilite")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.civilite && (
                    <Typography>{errors.civilite.message}</Typography>
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
                    Prénom{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("first_name", {
                        onChange: (e) => setUpperCase("first_name", e),
                      })}
                      id="first_name"
                      name="first_name"
                    />
                  ) : (
                    <Typography>{getValues("first_name")}</Typography>
                  )}
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Nom{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("surname", {
                        onChange: (e) => setUpperCase("surname", e),
                      })}
                      id="surname"
                      name="surname"
                    />
                  ) : (
                    <Typography>{getValues("surname")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.surname && (
                    <Typography>{errors.surname.message}</Typography>
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
                    Nom de naissance
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("birth_name", {
                        onChange: (e) => setUpperCase("birth_name", e),
                      })}
                      id="birth_name"
                      name="birth_name"
                    />
                  ) : (
                    <Typography>{getValues("birth_name")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.birth_name && (
                    <Typography>{errors.birth_name.message}</Typography>
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
                    Date de naissance
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="date"
                      {...register("birth_date")}
                      id="birth_date"
                      name="birth_date"
                    />
                  ) : (
                    <Typography>
                      {convertDateFormat(getValues("birth_date") || "")}
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.birth_date && (
                    <Typography>{errors.birth_date.message}</Typography>
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
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("email")}
                      id="email"
                      name="email"
                    />
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
                    <TextField
                      fullWidth
                      {...register("phone_number")}
                      id="phone_number"
                      name="phone_number"
                    />
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
                          {...register("pays")}
                          id="pays"
                          name="pays"
                          defaultValue={tiersInfos.pays || ""}
                        >
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
                    Niveau d'étude
                  </Typography>
                  {editable && !isLoadingStudyLevels && studyLevels.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("study_level_id")}
                          name="study_level_id"
                          id="study_level_id"
                          defaultValue={tiersInfos.study_level_id || ""}
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
                  ) : (
                    <Typography>
                      {
                        studyLevels.find(
                          (studyLevel) =>
                            studyLevel.study_level_id ===
                            getValues("study_level_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.study_level_id && (
                    <Typography>{errors.study_level_id.message}</Typography>
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
                    Situation avant projet
                  </Typography>
                  {editable &&
                  !isLoadingSituationAvPrj &&
                  situationAvPrj.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("situation_before_prj_id")}
                          name="situation_before_prj_id"
                          id="situation_before_prj_id"
                          defaultValue={
                            tiersInfos.situation_before_prj_id || ""
                          }
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
                      </FormControl>
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
                  ) : (
                    <Typography>
                      {
                        situationAvPrj.find(
                          (situation) =>
                            situation.situation_before_prj_id ===
                            getValues("situation_before_prj_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.situation_before_prj_id && (
                    <Typography>
                      {errors.situation_before_prj_id.message}
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
                    Expérience professionnelle
                  </Typography>
                  {editable &&
                  !isLoadingSituationSocioPro &&
                  situationSocioPro.length ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("situation_socio_pro_id")}
                        name="situation_socio_pro_id"
                        id="situation_socio_pro_id"
                        defaultValue={tiersInfos.situation_socio_pro_id || ""}
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
                    </FormControl>
                  ) : (
                    <Typography>
                      {(() => {
                        const matchedSituation = situationSocioPro.find(
                          (situation) =>
                            situation["Liste PCS-ESE"] ===
                            getValues("situation_socio_pro_id")
                        );

                        return matchedSituation
                          ? `${matchedSituation["Liste PCS-ESE"]} - ${matchedSituation["Liste des professions et catégories socioprofessionnelles des emplois salariés des employeurs privés et publics"]}`
                          : "";
                      })()}
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.situation_socio_pro_id && (
                    <Typography>
                      {errors.situation_socio_pro_id.message}
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
                    Autorisation droit à l'image
                  </Typography>
                  {editable ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("image_authorisation")}
                        name="image_authorisation"
                        id="image_authorisation"
                        defaultValue={tiersInfos.image_authorisation || ""}
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
                    <Typography>{getValues("image_authorisation")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.image_authorisation && (
                    <Typography>
                      {errors.image_authorisation.message}
                    </Typography>
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
