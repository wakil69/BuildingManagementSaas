import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AccompagnementSouhait } from "../../../types/tiers/tiers";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { convertDateFormat } from "../../../utils/functions";
import { AnimatePresence, motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import customRequest from "../../../routes/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function InfosAccSouhait({
  accompagnementSouhait,
  id,
}: {
  accompagnementSouhait: AccompagnementSouhait;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { register, getValues, handleSubmit, setValue, watch } = useForm({
    defaultValues: accompagnementSouhait,
  });

  const souhaitUpdate = async (data: AccompagnementSouhait) => {
    try {
      setMessage("");

      const { formule_wishes, surface_wishes, ...others } = data;

      const dataToSend = {
        formule_wishes: JSON.stringify(formule_wishes),
        surface_wishes: JSON.stringify(surface_wishes),
        ...others,
      };

      const response = await customRequest.put(
        `/tiers/wishes/PP/${id}`,
        dataToSend
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

  const souhaitUpdateMutation = useMutation({
    mutationFn: (data: AccompagnementSouhait) => souhaitUpdate(data),
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

  const onSubmit = (data: AccompagnementSouhait) => {
    souhaitUpdateMutation.mutate(data);
  };

  const surfaceWishes = watch("surface_wishes");
  const formuleWishes = watch("formule_wishes");

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
          overflow: "hidden",
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Souhaits</Typography>
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
            <Box
              sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}
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
              {souhaitUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {souhaitUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
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
                            disabled={!editable}
                            checked={formuleWishes.Bureau}
                            onChange={(e) => {
                              setValue(
                                `formule_wishes.Bureau`,
                                e.target.checked
                              );
                            }}
                          />
                        }
                        label="Bureau"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Checkbox
                            disabled={!editable}
                            checked={formuleWishes["Bureau Partagé"]}
                            onChange={(e) => {
                              setValue(
                                `formule_wishes.Bureau Partagé`,
                                e.target.checked
                              );
                            }}
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
                            disabled={!editable}
                            checked={formuleWishes["Extra-Muros"]}
                            onChange={(e) => {
                              setValue(
                                `formule_wishes.Extra-Muros`,
                                e.target.checked
                              );
                            }}
                          />
                        }
                        label="Extra-Muros"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Checkbox
                            disabled={!editable}
                            checked={formuleWishes.Coworking}
                            onChange={(e) => {
                              setValue(
                                `formule_wishes.Coworking`,
                                e.target.checked
                              );
                            }}
                          />
                        }
                        label="Coworking"
                      />
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {Object.entries(accompagnementSouhait.surface_wishes)
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
                              Object.keys(accompagnementSouhait.surface_wishes)
                                .length / 4
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
                                  disabled={!editable}
                                  checked={surfaceWishes[size]}
                                  onChange={(e) => {
                                    setValue(
                                      `surface_wishes.${size}`,
                                      e.target.checked
                                    );
                                  }}
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
                      sx={{ width: "30%", height: "6rem", fontWeight: "bold" }}
                    >
                      Date prévisionnelle d'entrée
                    </TableCell>
                    <TableCell colSpan={2}>
                      {editable ? (
                        <TextField
                          type="date"
                          {...register("date_entree_wished")}
                          fullWidth
                        />
                      ) : (
                        <Box>
                          {convertDateFormat(
                            getValues("date_entree_wished") || ""
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
