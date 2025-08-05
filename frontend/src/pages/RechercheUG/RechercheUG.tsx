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
import { UgsSearch } from "../../types/ugs/ugs";
import { GridSearchIcon } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";

export default function RechercheUG() {
  const [search, setSearch] = useState("");
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const [isLoue, setIsLoue] = useState(false);
  const [isDisponible, setIsDisponible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate()
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsLoue(queryParams.get("loue") === "true");
    setIsDisponible(queryParams.get("disponible") === "true");
    setSelectedDate(queryParams.get("date_disponibilite") || "");
    setSearch(queryParams.get("search") || "");
  }, [location.search]);

  const handleSearchClick = () => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("loue", isLoue.toString());
    queryParams.set("disponible", isDisponible.toString());
    queryParams.set("search", search);
    if (selectedDate) {
      queryParams.set("date_disponibilite", selectedDate);
    } else {
      queryParams.delete("date_disponibilite");
    }
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
  };

  async function getBatiments(): Promise<Batiment[]> {
    try {
      const response = await customRequest.get("/admin/batiments");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      setBatimentChoice(response.data[0].batiment_id);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const {
    data: batiments,
    isLoading: isLoadingBatiments,
  } = useQuery<Batiment[]>({
    queryKey: ["Batiments"],
    queryFn: getBatiments,
    refetchOnWindowFocus: false,
  });

  const getUGs = async ({ pageParam = 0 }): Promise<UgsSearch> => {
    try {
      const response = await customRequest.get(`/ug/`, {
        params: {
          limit: 10,
          offset: pageParam,
          batiment_id: batimentChoice,
          search,
          loue: isLoue,
          disponible: isDisponible,
          dateAvailable: selectedDate
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
    data: ugs,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["ugs", batimentChoice],
    queryFn: getUGs,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next || null,
    enabled: !!batimentChoice,
    refetchOnWindowFocus: false,
  });

  const totalCount = ugs?.pages[0]?.totalCount || 0;

  const handleDownload = () => {
    if (!batimentChoice) {
      alert("Please select a batiment before downloading.");
      return;
    }

    const downloadUrl = `${
      import.meta.env.VITE_APP_API_URL
    }/ug/download-search?batiment_id=${batimentChoice}&search=${encodeURIComponent(
      search
    )}&loue=${isLoue}&disponible=${isDisponible}&dateAvailable=${selectedDate}`;

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
      {isLoadingBatiments ? (
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Date de disponibilité:
            </Typography>
            <TextField
              type="date"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Box>
          <Select
            labelId="batiment-select-label"
            value={batimentChoice || ""}
            onChange={(e) => setBatimentChoice(Number(e.target.value))}
            label="Select Batiment"
          >
            {batiments?.map((batiment) => (
              <MenuItem key={batiment.batiment_id} value={batiment.batiment_id}>
                {batiment.name}
              </MenuItem>
            ))}
          </Select>
          <FormControlLabel
            control={
              <Checkbox
                checked={isLoue}
                onChange={(e) => setIsLoue(e.target.checked)}
                name="loue"
              />
            }
            label="Loué"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isDisponible}
                onChange={(e) => setIsDisponible(e.target.checked)}
                name="disponible"
              />
            }
            label="Disponible"
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
                Intitulé
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Etage
              </TableCell>
              <TableCell sx={{ width: "40%", fontWeight: "bold" }}>
                Adresse
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Surf. Total (m²)
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Surf. Occ. (m²)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ugs?.pages?.map((page) =>
              page?.ugs?.map((ug) => {
                return (
                  <TableRow
                    key={ug.ug_id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)", 
                        cursor: "pointer", 
                      },
                      transition: "background-color 0.3s ease", 
                    }}
                    onClick={() => navigate(`/pageConnecte/patrimoine/recherche/visualisation/${ug.ug_id}`)}
                  >
                    <TableCell>{ug.name}</TableCell>
                    <TableCell>{ug.num_etage}</TableCell>
                    <TableCell>{ug.address}</TableCell>
                    <TableCell>{ug.surface}</TableCell>
                    <TableCell>{ug.surface_occupe}</TableCell>
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
