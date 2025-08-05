import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  areaElementClasses,
  LineChart,
} from "@mui/x-charts/LineChart";
import { LineItemIdentifier } from "@mui/x-charts";

export type StatCardProps = {
  trend?: "up" | "down" | "neutral";
  yAxis: number[];
  xAxis: string[];
  value: string;
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function ChartPortPrj({
  trend = "neutral",
  yAxis,
  xAxis,
  value,
}: StatCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const chartColor = trendColors[trend];

  const handlePointClick = (point: LineItemIdentifier) => {
    const dateFormule = xAxis[point.dataIndex || 1];
    window.scrollTo(0, 0);
    navigate(
      `/pageConnecte/tiers/recherche?Formule=2&&PM=true&PP=true&dateFormule=${dateFormule}`
    );
  };

  return (
    <Box sx={{ width: "100%", height: "100%", marginY: 3 }}>
      <Typography variant="h4" component="p">
        {value}
      </Typography>
      <LineChart
        colors={[chartColor]}
        series={[
          {
            data: yAxis,
            area: true,
            showMark: true,
          },
        ]}
        xAxis={[
          {
            scaleType: "band",
            data: xAxis,
          },
        ]}
        leftAxis={null}
        bottomAxis={null}
        width={1000}
        height={200}
        margin={{ top: 20, bottom: 3, left: 0, right: 0 }}
        sx={{
          [`& .${areaElementClasses.root}`]: {
            fill: `url(#area-gradient-${value})`,
          },
          "& .MuiMarkElement-root": {
            display: "none",
          },
          "&:hover .MuiMarkElement-root": {
            display: "block",
          },
        }}
        onMarkClick={(_, d) => {
          handlePointClick(d);
        }}
      >
        <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
      </LineChart>
    </Box>
  );
}
