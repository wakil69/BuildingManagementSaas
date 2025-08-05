import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import customRequest from "../../../../routes/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountType } from "../../../../types/Admin/Administration";
import OverlayRemoveAccount from "../overlayRemoveAccount/overlayRemoveAccount";
import AddAccount from "../AddAccount/AddAccount";

export default function AccountsVisu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteFormule, setIsOpenDeleteFormule] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  async function getAccounts(): Promise<AccountType[]> {
    try {
      const response = await customRequest.get("/users/accounts");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: accounts = [] } = useQuery<AccountType[]>({
    queryKey: ["accounts"],
    queryFn: getAccounts,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const updateAccount = async (data: {
    role: "admin" | "user";
    user_id: number;
  }) => {
    try {
      setMessage("");
      const response = await customRequest.put(`/users/account`, data);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.error);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const updateAccountMutation = useMutation({
    mutationFn: (data: { role: "admin" | "user"; user_id: number }) =>
      updateAccount(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  return (
    <Box sx={{ width: "100%" }} id="nature-ug">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.3s, transform 0.3s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: "scale(1.02)",
          },
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Comptes</Typography>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ overflow: "hidden", padding: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginY: 3,
              }}
            >
              <AddAccount />
              {updateAccountMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {updateAccountMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Libellé
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Email
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Rôle
                        </Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accounts.map((account, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                      >
                        <Dialog
                          open={isOpenDeleteFormule === account.user_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveAccount
                              setIsOpen={setIsOpenDeleteFormule}
                              firstName={account.first_name}
                              surname={account.last_name}
                              id={account.user_id}
                            />
                          </DialogContent>
                        </Dialog>

                        <TableCell align="center">
                          <Typography>
                            {account.last_name} {account.first_name}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{account.email}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Select
                            onChange={(e) => {
                              if (
                                e.target.value === "admin" ||
                                e.target.value === "user"
                              ) {
                                updateAccountMutation.mutate({
                                  role: e.target.value,
                                  user_id: account.user_id,
                                });
                              }
                            }}
                            value={account.role}
                          >
                            <MenuItem key="admin" value="admin">
                              Administrateur
                            </MenuItem>
                            <MenuItem key="user" value="user">
                              Utilisateur
                            </MenuItem>
                          </Select>
                        </TableCell>

                        <TableCell
                          sx={{
                            display: "flex",
                            gap: 3,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            color="error"
                            onClick={() =>
                              setIsOpenDeleteFormule(account.user_id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
