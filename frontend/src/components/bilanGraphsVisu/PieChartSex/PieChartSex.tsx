import { Box, Stack, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { useMemo } from "react";

export default function PieChartSex({
  data,
}: {
  data: { label: string; value: number }[];
}) {

  interface StyledTextProps {
    variant: "primary" | "secondary";
  }

  const StyledText = styled("text", {
    shouldForwardProp: (prop) => prop !== "variant",
  })<StyledTextProps>(({ theme }) => ({
    textAnchor: "middle",
    dominantBaseline: "central",
    fill: theme.palette.text.secondary,
    variants: [
      {
        props: {
          variant: "primary",
        },
        style: {
          fontSize: theme.typography.h5.fontSize,
        },
      },
      {
        props: ({ variant }) => variant !== "primary",
        style: {
          fontSize: theme.typography.body2.fontSize,
        },
      },
      {
        props: {
          variant: "primary",
        },
        style: {
          fontWeight: theme.typography.h5.fontWeight,
        },
      },
      {
        props: ({ variant }) => variant !== "primary",
        style: {
          fontWeight: theme.typography.body2.fontWeight,
        },
      },
    ],
  }));

  interface PieCenterLabelProps {
    primaryText: string;
    secondaryText: string;
  }

  function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
    const { width, height, left, top } = useDrawingArea();
    const primaryY = top + height / 2 - 10;
    const secondaryY = primaryY + 24;

    return (
      <>
        <StyledText variant="primary" x={left + width / 2} y={primaryY}>
          {primaryText}
        </StyledText>
        <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
          {secondaryText}
        </StyledText>
      </>
    );
  }

  const colors = [
    "hsl(220, 20%, 65%)",
    "hsl(220, 20%, 42%)",
    "hsl(220, 20%, 35%)",
    "hsl(220, 20%, 25%)",
  ];

  const totalNumber = useMemo(() => {
    return data.reduce((acc, cur) => {
      acc += cur.value;
      return acc;
    }, 0);
  }, [data]);

  const maxItemValue = useMemo(
    () => Math.max(...data.map((item) => item.value)),
    [data]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <PieChart
          colors={colors}
          margin={{
            left: 80,
            right: 80,
            top: 80,
            bottom: 80,
          }}
          series={[
            {
              data,
              innerRadius: 75,
              outerRadius: 100,
              paddingAngle: 0,
              highlightScope: { faded: "global", highlighted: "item" },
            },
          ]}
          height={260}
          width={260}
          slotProps={{
            legend: { hidden: true },
          }}
        >
          <PieCenterLabel
            primaryText={String(totalNumber)}
            secondaryText="Total"
          />
        </PieChart>
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
                  {item.label}
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
