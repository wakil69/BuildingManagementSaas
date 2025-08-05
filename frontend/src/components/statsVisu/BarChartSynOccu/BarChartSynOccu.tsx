import { Box, Typography } from "@mui/material";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

export default function GaugeSynthesisLocauxAvailable({
  value,
  objectif,
}: {
  value: number;
  objectif: number;
}) {
  return (
    <Box sx={{ width: "100%", height: "100%", marginY: 3 }}>
      <Typography variant="h4" component="p">
        {value} / {objectif}
      </Typography>

      <GaugeContainer
        width={200}
        height={200}
        startAngle={-110}
        endAngle={110}
        value={value}
        valueMax={objectif}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer />
      </GaugeContainer>
    </Box>
  );
}
