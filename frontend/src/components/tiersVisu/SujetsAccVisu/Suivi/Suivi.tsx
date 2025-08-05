import { useMemo, useState } from "react";
import { Badge, Box, MenuItem, Select, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { Suivi } from "../../../../types/tiers/tiers";
import CollapsibleSuivi from "./CollapsibleSuivi.tsx/CollapsibleSuivi";
import AddSuivi from "../AddSuivi/AddSuivi";
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";
import { sumDurations } from "../../../../utils/functions";
import DownloadIcon from "@mui/icons-material/Download";
import {
  DateCalendar,
  DayCalendarSkeleton,
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export default function SuivisVisu({
  suivis,
  id,
}: {
  suivis: Suivi[];
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sujetSelected, setSujetSelected] = useState<null | number>(null);
  const [dateSuivi, setDateSuivi] = useState<string | null>(null);
  const sujets = useMemo(() => {
    return Array.from(
      new Set(suivis.map((suivi) => suivi.sujet_accompagnement_id))
    );
  }, [suivis]);

  const timeTotal = useMemo(() => {
    const filteredSuivis = suivis.filter(
      (suivi) =>
        ((sujetSelected && suivi.sujet_accompagnement_id === sujetSelected) ||
          !sujetSelected) &&
        (!dateSuivi || suivi.date_acc_suivi === dateSuivi)
    );
    return sumDurations(filteredSuivis);
  }, [suivis, sujetSelected, dateSuivi]);

  const nbMeetings = useMemo(() => {
    return suivis.filter(
      (suivi) =>
        ((sujetSelected && suivi.sujet_accompagnement_id === sujetSelected) ||
          !sujetSelected) &&
        (!dateSuivi || suivi.date_acc_suivi === dateSuivi)
    ).length;
  }, [suivis, sujetSelected, dateSuivi]);

  const { sujetsAcc } = useSujetsAcc();

  const handleDownload = () => {
    const downloadUrl = `${
      import.meta.env.VITE_APP_API_URL
    }/tiers/download-suivi/PP/${id}`;

    window.open(downloadUrl, "_blank");
  };

  const highlightedDays = useMemo(
    () =>
      suivis
        .filter(
          (suivi) =>
            (sujetSelected &&
              suivi.sujet_accompagnement_id === sujetSelected) ||
            !sujetSelected
        )
        .map((suivi) => dayjs(suivi.date_acc_suivi)),
    [suivis, sujetSelected, dateSuivi]
  );

  const serverDay = (
    props: PickersDayProps<Dayjs> & { highlightedDays?: Dayjs[] }
  ) => {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected =
      !outsideCurrentMonth && dateSuivi === day.format("YYYY-MM-DD");

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={
          highlightedDays.some((highlightedDay) =>
            highlightedDay.isSame(day, "day")
          )
            ? "🌚"
            : undefined
        }
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          selected={isSelected}
        />
      </Badge>
    );
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    const newDateString = newDate?.format("YYYY-MM-DD") || null;

    setDateSuivi(newDateString === dateSuivi ? null : newDateString);
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
        <Typography variant="h6">Accompagnements</Typography>
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
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 3,
                gap: 3,
              }}
            >
              <AddSuivi id={id} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                  marginBottom: 6,
                }}
              >
                <Select
                  value={String(sujetSelected) || ""}
                  onChange={(e) => setSujetSelected(Number(e.target.value))}
                  defaultValue={""}
                >
                  <MenuItem key="" value="">
                    --------
                  </MenuItem>
                  {sujets.map((sujetId: number) => {
                    return (
                      <MenuItem key={sujetId} value={sujetId}>
                        {
                          sujetsAcc.find(
                            (sujetAcc) =>
                              sujetAcc.sujet_accompagnement_id === sujetId
                          )?.name
                        }
                      </MenuItem>
                    );
                  })}
                </Select>
                <Typography>
                  Total du temps consacré à la personne: <b>{timeTotal}</b>
                </Typography>
                <Typography>
                  Nombre de rencontres: <b>{nbMeetings}</b>
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      color: "primary.main",
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transition:
                        "transform 0.3s ease-in-out, color 0.3s ease-in-out",
                    },
                  }}
                  onClick={handleDownload}
                >
                  {" "}
                  <DownloadIcon color="primary" onClick={handleDownload} />
                </Box>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  renderLoading={() => <DayCalendarSkeleton />}
                  slots={{
                    day: serverDay,
                  }}
                  slotProps={{
                    day: {
                      highlightedDays,
                    } as any,
                    previousIconButton: {
                      sx: {
                        marginRight: "3px",
                        zIndex: 1,
                      },
                    },
                    nextIconButton: {
                      sx: {
                        marginLeft: "3px",
                        zIndex: 1,
                      },
                    },
                  }}
                  onChange={handleDateChange}
                  sx={{
                    margin: "0 auto",
                    maxWidth: "400px",
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </LocalizationProvider>{" "}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
              }}
            >
              {suivis
                .filter(
                  (suivi) =>
                    ((sujetSelected &&
                      suivi.sujet_accompagnement_id === sujetSelected) ||
                      !sujetSelected) &&
                    (!dateSuivi || suivi.date_acc_suivi === dateSuivi)
                )
                .map((suivi) => {
                  return (
                    <CollapsibleSuivi
                      key={suivi.suivi_id}
                      suivi={suivi}
                      id={id}
                    />
                  );
                })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
