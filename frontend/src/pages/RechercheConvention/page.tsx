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
import { ConventionsSearch } from "../../types/convention/convention";
import { convertDateFormat } from "../../utils/functions";

export default function RechercheConventions() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const [typeConvention, setTypeConvention] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isResilie, setIsResilie] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSelectedDate(
      queryParams.get("dateConvention") ||
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
    setTypeConvention(queryParams.get("type") || null);
    setIsActive(queryParams.get("active") === "true");
    setIsResilie(queryParams.get("resilie") === "true");
    setSearch(queryParams.get("search") || "");
  }, [location.search]);

  const handleSearchClick = () => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set(
      "dateConvention",
      selectedDate ? selectedDate.toString() : ""
    );
    queryParams.set(
      "BatimentID",
      batimentChoice ? batimentChoice.toString() : ""
    );
    queryParams.set("type", typeConvention ? typeConvention.toString() : "");
    queryParams.set("active", isActive.toString());
    queryParams.set("resilie", isResilie.toString());
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

  const getConventions = async ({ pageParam = 0 }): Promise<ConventionsSearch> => {
    try {
      const response = await customRequest.get(`/convention/`, {
        params: {
          limit: 10,
          offset: pageParam,
          batiment_id: batimentChoice,
          typ_conv: typeConvention,
          selectedDate,
          search,
          active: isActive,
          resilie: isResilie,
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
    data: conventions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["conventions"],
    queryFn: getConventions,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next || null,
    enabled: !!batimentChoice,
    refetchOnWindowFocus: false,
  });

  const totalCount = conventions?.pages[0]?.totalCount || 0;

  const handleDownload = () => {
    if (!batimentChoice) {
      alert("Please select a batiment before downloading.");
      return;
    }

    const downloadUrl = `${
      import.meta.env.VITE_APP_API_URL
    }/tiers/download-search?batiment_id=${batimentChoice}&active=${isActive}&typ_conv=${typeConvention}&resilie=${isResilie}&search=${encodeURIComponent(
      search
    )}&dateConvention=${selectedDate}`;

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
            value={typeConvention || ""}
            onChange={(e) =>
              setTypeConvention(e.target.value ? e.target.value : null)
            }
          >
            <MenuItem key="" value="">
              -------
            </MenuItem>
            <MenuItem key="PEPINIERE" value="PEPINIERE">
              PEPINIERE
            </MenuItem>
            <MenuItem key="COWORKING" value="COWORKING">
              COWORKING
            </MenuItem>
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                name="active"
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isResilie}
                onChange={(e) => setIsResilie(e.target.checked)}
                name="resilie"
              />
            }
            label="Résilié"
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
              <TableCell sx={{ width: "40%", fontWeight: "bold" }}>
                Dénomination entreprise
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Formule
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Date de début
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Date de fin
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                Statut
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conventions?.pages?.map((page) =>
              page?.global?.map((convention, index) => {
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
                        `/pageConnecte/convention/recherche/visualisation/${convention.conv_id}/${convention.version}`
                      )
                    }
                  >
                    <TableCell>{convention.raison_sociale}</TableCell>
                    <TableCell>{convention.typ_conv}</TableCell>
                    <TableCell>{convertDateFormat(convention.date_debut)}</TableCell>
                    <TableCell>{convertDateFormat(convention.date_fin || "")}</TableCell>
                    <TableCell>{convention.statut}</TableCell>
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
