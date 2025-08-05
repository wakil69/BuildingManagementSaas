import { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { Batiment } from "../../types/Admin/Administration";
import { GridSearchIcon } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import { TiersSearch } from "../../types/tiers/tiers";
import { useFormulesTypes } from "../../hooks/tiers/useFormules";

export default function RechercheTiers() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const [formuleChoice, setFormuleChoice] = useState<number | null>(null);
  const [isPM, setIsPM] = useState(true);
  const [isPP, setIsPP] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSelectedDate(
      queryParams.get("dateFormule") ||
        (() => {
          const parisDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/Paris",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date());
          return parisDate;
        })()
    );
    setBatimentChoice(Number(queryParams.get("BatimentID")) || null);
    setFormuleChoice(Number(queryParams.get("Formule")) || null);
    setIsPM(queryParams.get("PM") === "true");
    setIsPP(queryParams.get("PP") === "true");
    setSearch(queryParams.get("search") || "");
  }, [location.search]);

  const handleSearchClick = () => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("dateFormule", selectedDate ? selectedDate.toString() : "");
    queryParams.set(
      "BatimentID",
      batimentChoice ? batimentChoice.toString() : ""
    );
    queryParams.set("Formule", formuleChoice ? formuleChoice.toString() : "");
    queryParams.set("PM", isPM.toString());
    queryParams.set("PP", isPP.toString());
    queryParams.set("search", search);
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
  };

  async function getBatiments(): Promise<Batiment[]> {
    try {
      const response = await customRequest.get("/admin/batiments");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      if (!batimentChoice) {
        setBatimentChoice(response.data[0].batiment_id);
      }
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: batiments, isLoading: isLoadingBatiments } = useQuery<
    Batiment[]
  >({
    queryKey: ["Batiments"],
    queryFn: getBatiments,
    refetchOnWindowFocus: false,
  });

  const getTiers = async ({ pageParam = 0 }): Promise<TiersSearch> => {
    try {
      const response = await customRequest.get(`/tiers/`, {
        params: {
          limit: 10,
          offset: pageParam,
          batiment_id: batimentChoice,
          formule_id: formuleChoice,
          selectedDate,
          search,
          pm: isPM,
          pp: isPP,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const {
    data: tiers,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tiers"],
    queryFn: getTiers,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next || null,
    enabled: !!batimentChoice,
    refetchOnWindowFocus: false,
  });

  const totalCount = tiers?.pages[0]?.totalCount || 0;

  const handleDownload = () => {
    if (!batimentChoice) {
      alert("Please select a batiment before downloading.");
      return;
    }

    const downloadUrl = `${
      import.meta.env.VITE_APP_API_URL
    }/tiers/download-search?batiment_id=${batimentChoice}&pm=${isPM}&formule=${formuleChoice}&pp=${isPP}&search=${encodeURIComponent(
      search
    )}&dateFormule=${selectedDate}`;

    window.open(downloadUrl, "_blank");
  };

  return (
    <Box
      sx={{
        padding: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {isLoadingBatiments || isLoadingFormulesTypes ? (
        <CircularProgress color="info" />
      ) : batiments ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Select
            labelId="batiment-select-label"
            value={batimentChoice || ""}
            onChange={(e) => setBatimentChoice(Number(e.target.value))}
          >
            {batiments?.map((batiment) => (
              <MenuItem key={batiment.batiment_id} value={batiment.batiment_id}>
                {batiment.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            labelId="formule-select-label"
            value={formuleChoice || ""}
            onChange={(e) =>
              setFormuleChoice(e.target.value ? Number(e.target.value) : null)
            }
          >
            <MenuItem key="" value="">
              -------
            </MenuItem>
            {formulesTypes?.map((formule) => (
              <MenuItem key={formule.formule_id} value={formule.formule_id}>
                {formule.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            id="date-input"
            type="date"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPM}
                onChange={(e) => setIsPM(e.target.checked)}
                name="PM"
              />
            }
            label="PM"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPP}
                onChange={(e) => setIsPP(e.target.checked)}
                name="PP"
              />
            }
            label="PP"
          />
        </Box>
      ) : null}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
          maxWidth: 400,
          margin: "auto",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
          fullWidth
        />
        <IconButton
          color="primary"
          onClick={() => {
            handleSearchClick();
            refetch();
          }}
        >
          <GridSearchIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              color: "primary.main",
              cursor: "pointer",
              transform: "scale(1.1)",
              transition: "transform 0.3s ease-in-out, color 0.3s ease-in-out",
            },
          }}
          onClick={handleDownload}
        >
          {" "}
          <DownloadIcon color="primary" onClick={handleDownload} />
        </Box>
      </Box>
      <Typography sx={{ alignSelf: "flex-start" }}>
        Total éléments : {totalCount}
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Libellé
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Qualité
              </TableCell>
              <TableCell sx={{ width: "40%", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Téléphone
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiers?.pages?.map((page) =>
              page?.global?.map((tier, index) => {
                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        cursor: "pointer",
                      },
                      transition: "background-color 0.3s ease",
                    }}
                    onClick={() =>
                      navigate(
                        `/pageConnecte/tiers/recherche/visualisation/${tier.qualite}/${tier.id}`
                      )
                    }
                  >
                    <TableCell>{tier.libelle}</TableCell>
                    <TableCell>{tier.qualite}</TableCell>
                    <TableCell>{tier.email}</TableCell>
                    <TableCell>{tier.phone_number}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetching}
          variant="contained"
        >
          Charger plus
        </Button>
      )}
    </Box>
  );
}
