import {
  Box,
  LinearProgress,
  linearProgressClasses,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

export default function HeaderStatsEnt({
  data,
  nbEntretiens,
  totalTime,
}: {
  data: { name: string; value: number }[];
  totalTime: string;
  nbEntretiens: number;
}) {
  const colors = [
    "hsl(220, 20%, 65%)",
    "hsl(220, 20%, 42%)",
    "hsl(220, 20%, 35%)",
    "hsl(220, 20%, 25%)",
  ];

  const maxItemValue = useMemo(
    () => Math.max(...data.map((item) => item.value)),
    [data]
  );

  console.log(data);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          justifyContent: "start",
          gap: 3,
        }}
      >
        <Typography
          component="h2"
          variant="subtitle2"
          sx={{ fontWeight: "bold" }}
        >
          Nombre total d’heures d’entretiens : {totalTime}
        </Typography>
        <Typography
          component="h2"
          variant="subtitle2"
          sx={{ fontWeight: "bold" }}
        >
          Nombre total d’entretiens : {nbEntretiens}
        </Typography>
        <Typography
          component="h2"
          variant="subtitle2"
          sx={{ fontWeight: "bold" }}
        >
          Répartition par catégorie
        </Typography>
      </Box>
      {nbEntretiens ? (
        data.map((item, index: number) => {
          const intensityIndex = Math.floor(
            (item.value / maxItemValue) * (colors.length - 1)
          );

          const normalizedValue = (item.value / nbEntretiens) * 100;

          return (
            <Stack
              key={index}
              direction="row"
              sx={{ alignItems: "center", gap: 2, pb: 2 }}
            >
              <Stack sx={{ gap: 1, flexGrow: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "500" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {item.value} - <b>{Math.round(normalizedValue)}%</b>
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  aria-label="Number of meetings by formule"
                  value={normalizedValue}
                  sx={{
                    [`& .${linearProgressClasses.bar}`]: {
                      backgroundColor: colors[intensityIndex],
                    },
                  }}
                />
              </Stack>
            </Stack>
          );
        })
      ) : (
        <Typography color="primary">
          Aucune donnée pour cette période
        </Typography>
      )}
    </Box>
  );
}
