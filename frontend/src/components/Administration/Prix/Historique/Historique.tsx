import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
} from "@mui/material";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CollapsibleHistorique from "./CollapsibleHistorique.tsx/CollapsibleHistorique";
import { Batiment, HistoriqueSurfacePrix, HistoriqueSurfacePrixResponse } from "../../../../types/Admin/Administration";
import customRequest from "../../../../routes/api/api";

export default function Historique() {
  const navigate = useNavigate();
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const limit = 5;

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

  async function getHistoriquePrixUGs({
    pageParam = 0,
  }): Promise<HistoriqueSurfacePrixResponse> {
    try {
      const response = await customRequest.get(`/admin/historique-prix-ugs`, {
        params: {
          limit,
          offset: pageParam,
          batiment_id: batimentChoice,
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
  }

  const {
    data: historiquePages,
    isFetching: isFetchingHistorique,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["Historique", batimentChoice],
    queryFn: getHistoriquePrixUGs,
    enabled: !!batimentChoice,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.cursor || null;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        gap: 2,
        width:"100%"
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
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate("/pageConnecte/administration/reglages")}
          >
            Réglages
          </Button>
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
        </Box>
      ) : null}
      {isFetchingHistorique ? (
        <CircularProgress color="info" />
      ) : (
        <Box
          sx={{ padding: 2, gap: 6, display: "flex", flexDirection: "column", width:"100%" }}
        >
          {
            historiquePages?.pages?.map((page: HistoriqueSurfacePrixResponse) =>
              page?.historique?.map((item: HistoriqueSurfacePrix) => {
                return <CollapsibleHistorique historique={item} />;
              })
            )}
  
          {hasNextPage && (
            <Button
              variant="outlined"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <CircularProgress size={20} />
              ) : (
                "Charger plus"
              )}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
