import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FirstMeeting } from "../../../types/tiers/tiers";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import customRequest from "../../../routes/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { usePrescriber } from "../../../hooks/tiers/usePrescriber";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";

const validationSchemaFirstMeeting = Yup.object().shape({
  first_meeting_date: Yup.string().nullable(),
  first_meeting_hour_begin: Yup.string()
    .nullable()
    .length(5, "Le format doit être HH:MM")
    .when("first_meeting_date", {
      is: (value: string) => !!value,
      then: (schema) =>
        schema.required(
          "L'heure de début est obligatoire lorsque la date est renseignée."
        ),
    }),
  first_meeting_hour_end: Yup.string()
    .nullable()
    .length(5, "Le format doit être HH:MM")
    .when("first_meeting_date", {
      is: (value: string) => !!value,
      then: (schema) =>
        schema.required(
          "L'heure de fin est obligatoire lorsque la date est renseignée."
        ),
    }),
  prescriber_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  first_meeting_feedback: Yup.string().nullable(),
});

export default function FirstMeetingInfos({
  firstMeeting,
  id,
}: {
  firstMeeting: FirstMeeting;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { prescribers, isLoadingPrescriber } = usePrescriber();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaFirstMeeting),
    defaultValues: firstMeeting,
  });

  const firstMeetingUpdate = async (data: FirstMeeting) => {
    try {
      setMessage("");

      const response = await customRequest.put(
        `/tiers/first-meeting/PP/${id}`,
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

  const firstMeetingUpdateMutation = useMutation({
    mutationFn: (data: FirstMeeting) => firstMeetingUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["tiers", "PP", id],
      });
      setTimeout(() => {
        setMessage("");
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: FirstMeeting) => {
    firstMeetingUpdateMutation.mutate(data);
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
          overflow: "hidden",
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Premier entretien</Typography>
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
              {firstMeetingUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {firstMeetingUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 3,
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
                    disabled={!editable}
                    type="date"
                    fullWidth
                    {...register("first_meeting_date")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.first_meeting_date && (
                    <Typography>{errors.first_meeting_date.message}</Typography>
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
                    disabled={!editable}
                    placeholder="HH:MM"
                    {...register("first_meeting_hour_begin")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.first_meeting_hour_begin && (
                    <Typography>
                      {errors.first_meeting_hour_begin.message}
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
                    disabled={!editable}
                    placeholder="HH:MM"
                    {...register("first_meeting_hour_end")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.first_meeting_hour_end && (
                    <Typography>
                      {errors.first_meeting_hour_end.message}
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
                        disabled={!editable}
                        {...register("prescriber_id")}
                        defaultValue={firstMeeting.prescriber_id || ""}
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
                {errors.prescriber_id && (
                  <Typography>{errors.prescriber_id.message}</Typography>
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
                  disabled={!editable}
                  rows={4}
                  margin="normal"
                  {...register("first_meeting_feedback")}
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                {errors.first_meeting_feedback && (
                  <Typography>
                    {errors.first_meeting_feedback.message}
                  </Typography>
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
