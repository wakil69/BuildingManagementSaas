import { useState } from "react";
import { Treemap, Tooltip, TooltipProps } from "recharts";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

interface CustomizedContentProps {
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  parentName: string;
  name: { etage: string; pourcentage: string }[] | string;
  surfaceOcc: number;
  ug_id: number;
}

export default function TreeLocaux({
  data,
}: {
  data: {
    name: { etage: string; pourcentage: string }[];
    children: {
      surfaceOcc: number;
      ug_id: number;
      name: string;
      parentName: string;
      size: number;
      tenants: string | null;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  const [hoveredCell, setHoveredCell] = useState<
    null | { etage: string; pourcentage: string }[] | string
  >(null);
  const [isTreemapHovered, setIsTreemapHovered] = useState(false);

  const handleTreemapMouseEnter = () => {
    setIsTreemapHovered(true);
  };

  const handleTreemapMouseLeave = () => {
    setIsTreemapHovered(false);
  };

  const handleMouseEnter = (
    name: { etage: string; pourcentage: string }[] | string
  ) => {
    setHoveredCell(name);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const floorColors: Record<string, string> = {
    "ETAGE 1": "#007bff", // Blue
    "ETAGE 2": "#ff7f0e", // Orange
    "ETAGE 3": "#6f42c1", // Purple
    "ETAGE 4": "#ffc107", // Yellow
    "ETAGE 5": "#17a2b8", // Teal
    "ETAGE 6": "#28a745", // Green
    "ETAGE 7": "#dc3545", // Red
    "ETAGE 8": "#fd7e14", // Dark Orange
    "ETAGE 9": "#343a40", // Dark Gray
    "ETAGE 10": "#6610f2", // Dark Purple
  };

  const COLORS_SURFACE_LIBRE = ["#7ed957", "#e50e0e"];

  const getColor = (surfaceOcc: number) => {
    if (surfaceOcc > 0) {
      return COLORS_SURFACE_LIBRE[1];
    } else if (surfaceOcc == 0) {
      return COLORS_SURFACE_LIBRE[0];
    }
  };

  const CustomizedContent = (props: CustomizedContentProps) => {
    const { depth, x, y, width, height, parentName, name, surfaceOcc, ug_id } =
      props;
    const isHovered = depth == 2 ? hoveredCell == name : null;
    let color;
    let opacity = 0.8;
    const etage = depth == 1 && Array.isArray(name) ? name[0]["etage"] : null;
    const pourcentage =
      depth == 1 && Array.isArray(name) ? name[0]["pourcentage"] : null;
    if (depth === 1 && etage) {
      color = floorColors[etage];
    } else {
      color = isHovered ? getColor(surfaceOcc) : floorColors[parentName];
      opacity = isHovered || hoveredCell === null ? 1 : 0.5;
    }

    return (
      <g
        onMouseEnter={() => handleMouseEnter(name)}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          navigate(`/pageConnecte/patrimoine/recherche/visualisation/${ug_id}`);
        }}
      >
        {depth == 1 && !isTreemapHovered && (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              style={{
                fill: color,
                stroke: "#fff",
                strokeWidth: 2 / (depth + 1e-10),
                strokeOpacity: 1 / (depth + 1e-10),
                opacity: opacity,
              }}
            />
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {etage} - {pourcentage}
            </text>
          </>
        )}
        {depth === 2 && isTreemapHovered && (
          <>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              style={{
                fill: color,
                stroke: "#fff",
                strokeWidth: 2 / (depth + 1e-10),
                strokeOpacity: 1 / (depth + 1e-10),
                opacity: opacity,
              }}
            />
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize=".8rem"
            >
              {typeof name === "string" && name}
            </text>
          </>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <p>Libellé: {data.name}</p>
          <p>Surface: {data.size}</p>
          <p>Surface Occupée: {data.surfaceOcc}</p>
          {data.tenants && <p>Locataire(s): {data.tenants}</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <Box
      onMouseEnter={handleTreemapMouseEnter}
      onMouseLeave={handleTreemapMouseLeave}
      sx={{ marginY: 3, display:"flex", justifyContent:"center" }}
    >
      <Treemap
        width={1000}
        height={1200}
        data={data}
        dataKey={"size"}
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        // @ts-ignore: Ignore type checking for the content prop
        content={
          CustomizedContent as React.ComponentType<CustomizedContentProps>
        }
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </Box>
  );
}
