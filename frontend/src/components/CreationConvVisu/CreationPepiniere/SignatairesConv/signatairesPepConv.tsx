import {
  FieldErrors,
  UseFieldArrayUpdate,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import {
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreatePepConvention, Signataire } from "../../../../types/convention/convention";
import customRequest from "../../../../routes/api/api";
import { convertDateFormat } from "../../../../utils/functions";

export default function CreationSignatairesPepConv({
  update,
  getValues,
  register,
  setValue,
  errors,
  tiepmId,
}: {
  update: UseFieldArrayUpdate<CreatePepConvention>;
  register: UseFormRegister<CreatePepConvention>;
  setValue: UseFormSetValue<CreatePepConvention>;
  errors: FieldErrors<CreatePepConvention>;
  getValues: UseFormGetValues<CreatePepConvention>;
  tiepmId: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  async function getSignataires(): Promise<Signataire[]> {
    try {
      const response = await customRequest.get(
        `/convention/signataires?pm=${getValues("tiepm_id")}`
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setValue(
        "signataires",
        response.data.map((item: Signataire) => {
          return { tiepp_id: item.tiepp_id };
        })
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: signataires = [], isLoading: isLoadingSignataires } = useQuery<
    Signataire[]
  >({
    queryKey: ["signataires", tiepmId],
    queryFn: getSignataires,
    refetchOnWindowFocus: false,
    enabled: !!tiepmId,
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
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Signataires</Typography>
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
                            Dirigeant
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography align="center" fontWeight="600">
                            Date de début
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="600">Date de fin</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="600">Relation</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="600">Statut</Typography>
                        </TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {signataires.length && !isLoadingSignataires ? (
                        signataires.map((signataire, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                transition:
                                  "background-color 0.3s, transform 0.3s",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetUrl = `/pageConnecte/tiers/recherche/visualisation/PP/${signataire.tiepp_id}`;
                              window.open(targetUrl, "_blank");
                            }}
                          >
                            <TableCell align="center">
                              <Typography>{signataire.libelle}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography>
                                {convertDateFormat(
                                  signataire.relation_date_debut || ""
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Typography>
                                {convertDateFormat(
                                  signataire.relation_date_fin || ""
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Typography>{signataire.fonction}</Typography>
                            </TableCell>
                            <TableCell
                              align="center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                {...register(`signataires.${index}.checked`)}
                                onChange={(e) =>
                                  update(index, {
                                    tiepp_id: signataire.tiepp_id,
                                    checked: e.target.checked,
                                  })
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : isLoadingSignataires ? (
                        <CircularProgress />
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.signataires && errors.signataires.root && (
                    <Typography>{errors.signataires.root.message}</Typography>
                  )}
                  {errors.signataires && (
                    <Typography>{errors.signataires.message}</Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
