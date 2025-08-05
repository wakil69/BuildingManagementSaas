import { Box, Card, CardContent, Typography } from "@mui/material";
import PieChartSex from "./PieChartSex/PieChartSex";
import { BilanGraphsType } from "../../types/stats/stats";
import PieChartEdu from "./PieChartEdu/PieChartEdu";
import BarChartAges from "./BarChartAges/BarChartAges";
import BarChartScpAvPrj from "./BarChartScpAvPrj/BarChartScpAvPrj";
import PieChartOriginGeo from "./PieChartOriginGeo/PieChartOriginGeo";

export default function BilanGraphs({
  formule,
  data,
}: {
  data: BilanGraphsType;
  formule: string;
}) {
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}
    >
      {formule === "PEPINIERE" ? (
        <>
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
              Répartition Homme/Femme
              </Typography>
              {data &&
                "hostedPPSexPep" in data &&
                (data.hostedPPSexPep.length ? (
                  <PieChartSex data={data.hostedPPSexPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Niveau de qualification
              </Typography>
              {data &&
                "eduPep" in data &&
                (data.eduPep.length ? (
                  <PieChartEdu data={data.eduPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Tranches d'âges
              </Typography>
              {data &&
                "agesPep" in data &&
                (data.agesPep.length ? (
                  <BarChartAges data={data.agesPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Situation avant immatriculation
              </Typography>
              {data &&
                "scpAvPrjPep" in data &&
                (data.scpAvPrjPep.length ? (
                  <BarChartScpAvPrj data={data.scpAvPrjPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Origine Géographique
              </Typography>
              {data &&
                "comunPersonsPep" in data &&
                (data.comunPersonsPep.length ? (
                  <PieChartOriginGeo data={data.comunPersonsPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Statut juridique
              </Typography>
              {data &&
                "statutJurPep" in data &&
                (data.statutJurPep.length ? (
                  <PieChartOriginGeo data={data.statutJurPep} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
            </CardContent>
          </Card>

        </>
      ) : formule === "PORTEUR PROJET" ? (
        <>
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
              Répartition Homme/Femme
              </Typography>
              {data &&
                "hostedPPSexPrj" in data &&
                (data.hostedPPSexPrj.length ? (
                  <PieChartSex data={data.hostedPPSexPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Niveau de qualification
              </Typography>
              {data &&
                "eduPrj" in data &&
                (data.eduPrj.length ? (
                  <PieChartEdu data={data.eduPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Tranches d'âges
              </Typography>
              {data &&
                "agesPrj" in data &&
                (data.agesPrj.length ? (
                  <BarChartAges data={data.agesPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Situation avant immatriculation
              </Typography>
              {data &&
                "scpAvPrjPrj" in data &&
                (data.scpAvPrjPrj.length ? (
                  <BarChartScpAvPrj data={data.scpAvPrjPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Origine Géographique
              </Typography>
              {data &&
                "comunPersonsPrj" in data &&
                (data.comunPersonsPrj.length ? (
                  <PieChartOriginGeo data={data.comunPersonsPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Statut juridique
              </Typography>
              {data &&
                "statutJurPrj" in data &&
                (data.statutJurPrj.length ? (
                  <PieChartOriginGeo data={data.statutJurPrj} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
            </CardContent>
          </Card>
        </>
      ) : formule === "EXTRA-MUROS" ? (
        <>
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
                Répartition Homme/Femme
              </Typography>
              {data &&
                "hostedPPSexMur" in data &&
                (data.hostedPPSexMur.length ? (
                  <PieChartSex data={data.hostedPPSexMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Niveau de qualification
              </Typography>
              {data &&
                "eduMur" in data &&
                (data.eduMur.length ? (
                  <PieChartEdu data={data.eduMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Tranches d'âges
              </Typography>
              {data &&
                "agesMur" in data &&
                (data.agesMur.length ? (
                  <BarChartAges data={data.agesMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Situation avant immatriculation
              </Typography>
              {data &&
                "scpAvPrjMur" in data &&
                (data.scpAvPrjMur.length ? (
                  <BarChartScpAvPrj data={data.scpAvPrjMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Origine Géographique
              </Typography>
              {data &&
                "comunPersonsMur" in data &&
                (data.comunPersonsMur.length ? (
                  <PieChartOriginGeo data={data.comunPersonsMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
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
              Statut juridique
              </Typography>
              {data &&
                "statutJurMur" in data &&
                (data.statutJurMur.length ? (
                  <PieChartOriginGeo data={data.statutJurMur} />
                ) : (
                  <Typography color="primary">
                    Aucune donnée pour cette période
                  </Typography>
                ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );
}
