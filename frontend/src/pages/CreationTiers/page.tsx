import { Box, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import CreationTiersPPVisu from "../../components/CreationTiersVisu/CreationTiersPPVisu";
import CreationTiersPMVisu from "../../components/CreationTiersVisu/CreationTiersPMVisu";
import CreationTiersPPPMVisu from "../../components/CreationTiersVisu/creationTiersPPPM/CreationTiersPPPM";

export default function CreationTiersPage() {
  const [typeCreation, setTypeCreation] = useState("PPPM");

  return (
    <Box sx={{ width: "100%" }}>
      <Select
        labelId="batiment-select-label"
        value={typeCreation || ""}
        onChange={(e) => setTypeCreation(e.target.value)}
      >
        <MenuItem key="PPPM" value="PPPM">
          Personne Physique et Morale
        </MenuItem>
        <MenuItem key="PP" value="PP">
          Personne Physique
        </MenuItem>
        <MenuItem key="PM" value="PM">
          Personne Morale
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
        {typeCreation === "PP" && <CreationTiersPPVisu />}
        {typeCreation === "PM" && <CreationTiersPMVisu />}
        {typeCreation === "PPPM" && <CreationTiersPPPMVisu />}
      </Box>
    </Box>
  );
}
