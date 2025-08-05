import {
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Box,
  Button,
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
import {
  CreatePepConvention,
} from "../../../../types/convention/convention";
import RowUgCreationConv from "./rowUgCreationConv/rowUgCreationConv";

export default function CreationLocauxPepConv({
  append,
  getValues,
  register,
  fields,
  setValue,
  errors,
  batimentId,
  remove,
  watch,
}: {
  append: UseFieldArrayAppend<CreatePepConvention, "ugs">;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<CreatePepConvention>;
  setValue: UseFormSetValue<CreatePepConvention>;
  errors: FieldErrors<CreatePepConvention>;
  getValues: UseFormGetValues<CreatePepConvention>;
  fields: FieldArrayWithId<CreatePepConvention, "ugs", "id">[];
  batimentId: number;
  watch: UseFormWatch<CreatePepConvention>;
}) {
  const [isOpen, setIsOpen] = useState(true);

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
        <Typography variant="h6">Locaux</Typography>
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
              <Box sx={{ marginY: 3 }}>
                <Button
                  onClick={() =>
                    append({
                      ug_id: 0,
                      date_debut: "",
                      date_fin: null,
                      surface_rent: 0,
                      name: "",
                      surface_available: 0,
                      surface: 0
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
                      {fields.length
                        ? fields.map((_: any, index: number) => (
                            <RowUgCreationConv
                              key={index}
                              index={index}
                              errors={errors}
                              register={register}
                              getValues={getValues}
                              batimentId={batimentId}
                              remove={remove}
                              setValue={setValue}
                              watch={watch}
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
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
