import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import customRequest from "../../routes/api/api";
import { useQuery } from "@tanstack/react-query";
import BilanGraphs from "../../components/bilanGraphsVisu/BilanGraphs";
import { BilanGraphsType } from "../../types/stats/stats";

export default function BilanStatsPage() {
  const [dateYearRef, setDateYearRef] = useState(
    new Date().getFullYear().toString()
  );
  const [formuleChosen, setFormuleChosen] = useState("PEPINIERE");

  async function getBilanGraphs(): Promise<BilanGraphsType> {
    try {
      const link = `${
        import.meta.env.VITE_APP_API_URL
      }/stats/bilan-graphs?dateYearRef=${dateYearRef}`;

      console.log(link, import.meta.env.VITE_APP_API_URL);
      const response = await customRequest.get(link);
      console.log(response);
      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: bilanGraphs, isLoading: isLoadingBilanGraphs } = useQuery({
    queryKey: ["bilans_graphs", dateYearRef],
    queryFn: getBilanGraphs,
    refetchOnWindowFocus: false,
  });

  console.log(bilanGraphs);

  const downloadStats = async () => {
    const link = `${
      import.meta.env.VITE_APP_API_URL
    }/stats/download-bilan-formules?dateYearRef=${dateYearRef}`;
    window.open(link, "_blank");
  };

  const downloadBilanAnte = async () => {
    const link = `${
      import.meta.env.VITE_APP_API_URL
    }/stats/download-bilan-ante?dateYearRef=${dateYearRef}`;
    window.open(link, "_blank");
  };

  const downloadBilanExtraMuros = async () => {
    const link = `${
      import.meta.env.VITE_APP_API_URL
    }/stats/download-bilan-extra-muros?dateYearRef=${dateYearRef}`;
    window.open(link, "_blank");
  };

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Bilans statistiques
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ fontWeight: "bold" }}
          >
            Année de référence
          </Typography>
          <TextField
            type="number"
            value={dateYearRef}
            onChange={(e) => setDateYearRef(e.target.value)}
            sx={{ width: 120 }}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadStats}
            sx={{ flexGrow: 1 }}
          >
            Exporter en fichier Excel - Bilan Formules
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadBilanAnte}
            sx={{ flexGrow: 1 }}
          >
            Exporter en fichier Excel - Bilan Ante
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadBilanExtraMuros}
            sx={{ flexGrow: 1 }}
          >
            Exporter en fichier Excel - Bilan Extra-Muros
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ fontWeight: "bold" }}
          >
            Formule
          </Typography>
          <Select
            value={formuleChosen}
            onChange={(e) => setFormuleChosen(e.target.value)}
          >
            <MenuItem value="PEPINIERE">PEPINIERE</MenuItem>
            <MenuItem value="PORTEUR PROJET">PORTEUR PROJET</MenuItem>
            <MenuItem value="EXTRA-MUROS">EXTRA-MUROS</MenuItem>
          </Select>
        </Box>
        {!isLoadingBilanGraphs && bilanGraphs ? (
          <BilanGraphs data={bilanGraphs} formule={formuleChosen} />
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Box>
  );
}
