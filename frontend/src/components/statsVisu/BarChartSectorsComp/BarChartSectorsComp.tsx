import {
  Box,
  LinearProgress,
  linearProgressClasses,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo, useState } from "react";

export default function BarChartSectorsComp({
  data,
}: {
  data: Record<string, { name: string; value: number }[]>;
}) {
  const theme = useTheme();
  const [formuleChosen, setFormuleChosen] = useState("PEPINIERE");

  const chartSetting = {
    yAxis: [
      {
        scaleType: "band" as const,
        dataKey: "name",
        valueFormatter: (name: string, context: any) => {
          return context.location === "tick"
            ? name
            : `${data[formuleChosen].find((d) => d.name === name)?.name}`;
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
    height: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 300 },
  };

  const colors = [
    "hsl(220, 20%, 65%)",
    "hsl(220, 20%, 42%)",
    "hsl(220, 20%, 35%)",
    "hsl(220, 20%, 25%)",
  ];

  const maxItemValue = useMemo(
    () => Math.max(...data[formuleChosen].map((item) => item.value)),
    [data[formuleChosen]]
  );

  return (
    <Box>
    <Select
      value={formuleChosen}
      onChange={(e) => setFormuleChosen(e.target.value)}
      sx={{ marginTop: 3 }}
    >
      <MenuItem value="PEPINIERE">PEPINIERE</MenuItem>
      <MenuItem value="PORTEUR PROJET">PORTEUR PROJET</MenuItem>
      <MenuItem value="EXTRA-MUROS">EXTRA-MUROS</MenuItem>
      <MenuItem value="COWORKING">COWORKING</MenuItem> 
      <MenuItem value="CENTRE D'AFFAIRES">CENTRE D'AFFAIRES</MenuItem> 
    </Select>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "start",
          marginY: 3,
        }}
      >
        <BarChart
          sx={{
            "& .MuiBarLabel-root": {
              fill: "white",
            },
          }}
          dataset={data[formuleChosen]}
          layout="horizontal"
          {...chartSetting}
        />
      </Box>
      {data[formuleChosen].map((item, index: number) => {
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
                  {item.value}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                aria-label="Number of users by country"
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
