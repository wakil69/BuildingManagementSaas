import { useNavigate } from "react-router-dom";
import customRequest from "../../routes/api/api";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { NotificationsSearch } from "../../types/convention/convention";

export default function Notifications() {
  const navigate = useNavigate();

  const getNotifications = async ({
    pageParam = 0,
  }): Promise<NotificationsSearch> => {
    try {
      const response = await customRequest.get(`/convention/notifications`, {
        params: {
          limit: 10,
          offset: pageParam,
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
    data: notifications,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next || null,
    refetchOnWindowFocus: false,
  });
  
  const totalCount = notifications?.pages[0]?.totalCount || 0;

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
      <Typography sx={{ alignSelf: "flex-start" }}>
        Total éléments : {totalCount}
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                Raison sociale
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Notification
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Statut de la convention
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications?.pages?.map((page) =>
              page?.notifications?.map((notification) => {
                return (
                  <TableRow
                    key={notification.conv_id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        cursor: "pointer",
                      },
                      transition: "background-color 0.3s ease",
                    }}
                    onClick={() =>
                      navigate(
                        `/pageConnecte/convention/recherche/visualisation/${notification.conv_id}/${notification.max_version}`
                      )
                    }
                  >
                    <TableCell>{notification.raison_sociale}</TableCell>
                    <TableCell>
                      Des actions sont à effectuer dans cette convention.
                    </TableCell>
                    <TableCell>{notification.statut}</TableCell>
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
