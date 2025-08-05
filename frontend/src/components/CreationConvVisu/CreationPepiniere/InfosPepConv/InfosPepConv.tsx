import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import {
  Box,
  FormControl,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useBatiments } from "../../../../hooks/tiers/useBatiments";
import { useAllPMs } from "../../../../hooks/useAllPMs/useAllPMs";
import { useDebounce } from "use-debounce";
import { SearchCompany } from "../../../../types/types";
import { CreatePepConvention } from "../../../../types/convention/convention";

export default function CreationInfosPepConv({
  register,
  setValue,
  errors,
}: {
  register: UseFormRegister<CreatePepConvention>;
  setValue: UseFormSetValue<CreatePepConvention>;
  errors: FieldErrors<CreatePepConvention>;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { batiments, isLoadingBatiments } = useBatiments();
  const [searchPM, setSearchPM] = useState("");
  const [debouncedSearchPM] = useDebounce(searchPM, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { allPMs, isLoadingAllPMs } = useAllPMs(debouncedSearchPM);

  const handleSelect = (pm: SearchCompany) => {
    setSearchPM(pm.raison_sociale);
    setValue("raison_sociale", pm.raison_sociale);
    setValue("tiepm_id", pm.tiepm_id);
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
        <Typography variant="h6">Informations générales</Typography>
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
            style={{ padding: 3 }}
          >
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
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    type="text"
                    value={searchPM}
                    onChange={(e) => setSearchPM(e.target.value)}
                    onFocus={() => setIsSearchActive(true)}
                    onBlur={() => setIsSearchActive(false)}
                    placeholder="Entreprise"
                    variant="outlined"
                    fullWidth
                    sx={{
                      width: "60%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                      },
                    }}
                  />
                  {isSearchActive && allPMs.length && searchPM.trim() ? (
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
                        {!isLoadingAllPMs &&
                          allPMs.map((pm) => (
                            <ListItem
                              key={pm.tiepm_id}
                              disablePadding
                              sx={{
                                "&:hover": {
                                  backgroundColor: "#f1f1f1",
                                },
                              }}
                            >
                              <ListItemButton
                                onMouseDown={() => handleSelect(pm)}
                              >
                                {pm.raison_sociale}
                              </ListItemButton>
                            </ListItem>
                          ))}
                      </List>
                    </Paper>
                  ) : null}
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.tiepm_id && (
                      <Typography>{errors.tiepm_id.message}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 3, marginY: 3 }}
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
                              setValue("ugs", [])
                              setValue("equipements", [])
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Date de signature*
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_signature")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_signature && (
                      <Typography>{errors.date_signature.message}</Typography>
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
                      {...register("date_debut")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_debut && (
                      <Typography>{errors.date_debut.message}</Typography>
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
                      {...register("date_fin")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_fin && (
                      <Typography>{errors.date_fin.message}</Typography>
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
