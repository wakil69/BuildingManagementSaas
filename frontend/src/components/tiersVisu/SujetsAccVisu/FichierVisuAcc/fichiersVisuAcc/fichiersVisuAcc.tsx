import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { FileGlobal } from "../../../../../types/types";
import customRequest from "../../../../../routes/api/api";
import OverlayRemoveFileAcc from "../overlayRemoveFileAcc/overlayRemoveFileAcc";

export default function FichiersVisuAcc({
  files,
  id,
  suiviId,
}: {
  files: FileGlobal[];
  id?: string;
  suiviId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [isOpenDeleteFile, setIsOpenDeleteFile] = useState<null | number>(null);

  const queryClient = useQueryClient();

  const addFiles = async (files: FileList) => {
    try {
      setMessage("");
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const response = await customRequest.post(
        `${
          import.meta.env.VITE_APP_API_URL
        }/tiers/suivi/files/PP/${id}/${suiviId}`,
        formData
      );
      if (response.status !== 200) {
        throw new Error("File upload failed.");
      }
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const addFilesMutation = useMutation({
    mutationFn: (data: FileList) => addFiles(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["tiers", "suivi", id],
      });
      setTimeout(() => {
        setMessage("");
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const handleFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFilesMutation.mutate(files);
    }
  };

  const handleFileSelect = () => {
    inputFileRef.current?.click();
  };

  return (
    <Box sx={{ width: "100%" }}>
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
        <Typography variant="h6">Fichiers du suivi</Typography>
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
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{ padding: 2, display: "flex", alignItems: "center", gap: 3 }}
            >
              <input
                type="file"
                ref={inputFileRef}
                onChange={handleFilesUpload}
                style={{ display: "none" }}
                multiple
              />
              <Button
                variant="contained"
                onClick={handleFileSelect}
                disabled={addFilesMutation.isPending}
                sx={{
                  backgroundColor: addFilesMutation.isPending
                    ? "primary.main"
                    : undefined,
                  color: addFilesMutation.isPending ? "white" : undefined,
                  "&.Mui-disabled": {
                    backgroundColor: "primary.main",
                    color: "white",
                    opacity: 0.8,
                  },
                }}
              >
                {addFilesMutation.isPending
                  ? "Les fichiers sont en cours d'importation..."
                  : "Importer des fichiers"}
              </Button>
              {addFilesMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {addFilesMutation.isError && message && (
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
                      <TableCell></TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Nom</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file, index) => (
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
                          open={isOpenDeleteFile === index}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveFileAcc
                              setIsOpen={setIsOpenDeleteFile}
                              filename={file.filename}
                              id={id}
                              suiviId={suiviId}
                            />
                          </DialogContent>
                        </Dialog>
                        <TableCell align="center">
                          {file.logo ? (
                            <img
                              src={file.logo}
                              alt="file-logo"
                              width={24}
                              height={24}
                            />
                          ) : (
                            <InsertDriveFileIcon
                              fontSize="small"
                              color="action"
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          <Tooltip title={file.filename} arrow>
                            <Typography noWrap>{file.filename}</Typography>
                          </Tooltip>
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
                            color="primary"
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setIsOpenDeleteFile(index)}
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
