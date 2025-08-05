import { Box, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export default function BarChartAges({
  data,
}: {
  data: { name: string; value: number }[];
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
    height: 400,
    margin: { top: 20, right: 20, bottom: 20, left: 100 },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        marginY: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
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
  );
}
