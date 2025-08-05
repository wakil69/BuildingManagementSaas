import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import customRequest from "../../routes/api/api";
import { useQuery } from "@tanstack/react-query";
import PieChartFormules from "../../components/statsVisu/PieChartFormules/PieChartFormules";
import { StatsOverall } from "../../types/stats/stats";
import SexeChart from "../../components/statsVisu/SexeChart/SexeChart";
import ChartPortPrj from "../../components/statsVisu/ChartPortPrj/ChartPortPrj";
import GaugeExtraMuros from "../../components/statsVisu/GaugeExtraMuros/GaugeExtraMuros";
import BarChartEntPep from "../../components/statsVisu/BarChartEntreePep/BarChartEntreePep";
import BarChartSortiePep from "../../components/statsVisu/BarChartSortiePep/BarChartSortiePep";
import BarChartSujetEnt from "../../components/statsVisu/BarChartSujetEnt/BarChartSujetEnt";
import TreeLocaux from "../../components/statsVisu/TreeLocaux/TreeLocaux";
import GaugeSynthesisLocauxAvailable from "../../components/statsVisu/BarChartSynOccu/BarChartSynOccu";
import BarChartSectorsComp from "../../components/statsVisu/BarChartSectorsComp/BarChartSectorsComp";
import HeaderStatsEnt from "../../components/statsVisu/HeaderStats/HeaderStats";

export default function StatsOverallPage() {
  const getParisDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const currentYear = new Date().getFullYear();
  const firstDayOfYear = new Date(`${currentYear}-01-01T00:00:00Z`);
  const today = new Date();

  const [dateDebut, setDateDebut] = useState(getParisDate(firstDayOfYear));
  const [dateFin, setDateFin] = useState(getParisDate(today));

  async function getStatsOverall(): Promise<StatsOverall> {
    try {
      const link = `${
        import.meta.env.VITE_APP_API_URL
      }/stats/overall/${dateDebut}/${dateFin}`;

      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: statsOverall, isLoading: isLoadingStatsOverall } = useQuery({
    queryKey: ["statistiques", dateDebut, dateFin],
    queryFn: getStatsOverall,
    refetchOnWindowFocus: false,
  });

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Tableau de bord
      </Typography>
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
            Date de début*
          </Typography>
          <TextField
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
            Date de fin
          </Typography>
          <TextField
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 3 }}>
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "headerStatsEnt" in statsOverall && (
                <HeaderStatsEnt
                  nbEntretiens={statsOverall.headerStatsEnt.nbEntretiens}
                  totalTime={statsOverall.headerStatsEnt.totalTime}
                  data={statsOverall.headerStatsEnt.totalNbSujetByFormule}
                />
              )
            )}
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 3 }}
      >
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Répartition des entreprises hébergées
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "hostedCompanies" in statsOverall &&
              (statsOverall.hostedCompanies.length ? (
                <PieChartFormules data={statsOverall.hostedCompanies} />
              ) : (
                <Typography color="primary">
                  Aucune donnée pour cette période
                </Typography>
              ))
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Parité hommes/femmes des entreprises hébergées
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "hostedPPSex" in statsOverall &&
              (statsOverall.hostedPPSex.length ? (
                <SexeChart data={statsOverall.hostedPPSex} />
              ) : (
                <Typography color="primary">
                  Aucune donnée pour cette période
                </Typography>
              ))
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 3,
            flexGrow: 1,
            height: "100%",
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Porteurs de projet accueillis
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "hostedPorteurProjet" in statsOverall &&
              (statsOverall.hostedCompanies.length ? (
                <ChartPortPrj
                  value={String(statsOverall.hostedPorteurProjet.yAxis.length)}
                  yAxis={statsOverall.hostedPorteurProjet.yAxis}
                  xAxis={statsOverall.hostedPorteurProjet.xAxis}
                />
              ) : (
                <Typography color="primary">
                  Aucune donnée pour cette période
                </Typography>
              ))
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 3,
            flexGrow: 1,
            height: "100%",
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Accompagnement extra-muros
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "accExtraMuros" in statsOverall && (
                <GaugeExtraMuros
                  value={statsOverall.accExtraMuros.value}
                  objectif={statsOverall.accExtraMuros.objectif}
                />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 3,
            flexGrow: 1,
            height: "100%",
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Synthèse locaux disponibles (%)
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "locDispo" in statsOverall && (
                <GaugeSynthesisLocauxAvailable
                  value={statsOverall.locDispo.value}
                  objectif={statsOverall.locDispo.objectif}
                />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 3,
            flexGrow: 1,
            height: "100%",
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Entrée à la pépinière
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "entCompanies" in statsOverall && (
                <BarChartEntPep data={statsOverall.entCompanies} />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 3,
            flexGrow: 1,
            height: "100%",
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Sortie de la pépinère
            </Typography>
            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "sorCompanies" in statsOverall && (
                <BarChartSortiePep data={statsOverall.sorCompanies} />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Répartition des secteurs d'activités (Pépinière)
            </Typography>

            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "sectorsCompanies" in statsOverall && (
                <BarChartSectorsComp data={statsOverall.sectorsCompanies} />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Sujets des entretiens réalisés avec les pépins
            </Typography>

            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "accEntretiens" in statsOverall && (
                <BarChartSujetEnt
                  nbEntretiens={statsOverall.accEntretiens.nbEntretiens}
                  totalTime={statsOverall.accEntretiens.totalTime}
                  data={statsOverall.accEntretiens.entretiens}
                  detail={statsOverall.accEntretiens.infos}
                />
              )
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexGrow: 1,
          }}
        >
          <CardContent>
            <Typography component="h2" variant="subtitle2">
              Occupation des locaux
            </Typography>

            {isLoadingStatsOverall ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 3 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              statsOverall &&
              "occLocaux" in statsOverall && (
                <TreeLocaux data={statsOverall.occLocaux} />
              )
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
