import {
  Box,
  LinearProgress,
  linearProgressClasses,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo } from "react";

export default function BarChartSujetEnt({
  data,
  detail,
  nbEntretiens,
  totalTime,
}: {
  data: { name: string; value: number }[];
  detail: {
    name: string;
    value: string;
    totalMinutes: number;
  }[];
  totalTime: string;
  nbEntretiens: number;
}) {
  const theme = useTheme();
  const chartSetting = {
    yAxis: [
      {
        scaleType: "band" as const,
        dataKey: "name",
        valueFormatter: (name: string, context: any) => {
          return context.location === "tick"
            ? name
            : `${data.find((d) => d.name === name)?.name}`;
        },
      },
    ],
    series: [
      {
        dataKey: "value",
        color: theme.palette.grey[700],
      },
    ],
    barLabel: (item: any) => {
      return item.value?.toString();
    },
    slotProps: { legend: { hidden: true } },
    width: 800,
    height: 500,
    margin: { top: 20, right: 20, bottom: 20, left: 250 },
  };

  const colors = [
    "hsl(220, 20%, 65%)",
    "hsl(220, 20%, 42%)",
    "hsl(220, 20%, 35%)",
    "hsl(220, 20%, 25%)",
  ];

  const maxItemValue = useMemo(
    () => Math.max(...detail.map((item) => item.totalMinutes)),
    [data]
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "start",
          marginY: 3,
        }}
      >
        <Typography>
          Pour un total de <b>{nbEntretiens} entretiens</b> qui représentent{" "}
          <b>{totalTime} heures d'accompagnement</b>.
        </Typography>

        <BarChart
          sx={{
            "& .MuiBarLabel-root": {
              fill: "white",
            },
          }}
          dataset={data}
          layout="horizontal"
          {...chartSetting}
        />
      </Box>
      {data.map((item, index: number) => {
        const intensityIndex = Math.floor(
          (item.value / maxItemValue) * (colors.length - 1)
        );
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
                  {item.value} - {detail.length && detail.find((sujet) => sujet.name == item.name)?.value}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: colors[intensityIndex],
                  },
                }}
              />
            </Stack>
          </Stack>
        );
      })}
    </Box>
  );
}
