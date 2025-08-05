import { Box, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import CreationPepVisu from "../../components/CreationConvVisu/CreationPepiniere/CreationPepiniereConv";
import CreationCoworkingVisu from "../../components/CreationConvVisu/CreationCoworking/CreationCoworkingConv";

export default function CreationConventionPage() {
  const [typeCreation, setTypeCreation] = useState("PEPINIERE");

  return (
    <Box sx={{ width: "100%" }}>
      <Select
        labelId="batiment-select-label"
        value={typeCreation || ""}
        onChange={(e) => setTypeCreation(e.target.value)}
      >
        <MenuItem key="PEPINIERE" value="PEPINIERE">
          PEPINIERE
        </MenuItem>
        <MenuItem key="COWORKING" value="COWORKING">
          COWORKING
        </MenuItem>
      </Select>
      <Box
        sx={{
          padding: 3,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {typeCreation === "PEPINIERE" && <CreationPepVisu />}
        {typeCreation === "COWORKING" && <CreationCoworkingVisu />}
      </Box>
    </Box>
  );
}
