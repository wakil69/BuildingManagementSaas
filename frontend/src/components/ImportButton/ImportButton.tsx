import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Typography } from "@mui/material";
import customRequest from "../../routes/api/api";
import DownloadIcon from "@mui/icons-material/Download";

export default function ImportButton({
  text,
  from,
}: {
  text: string;
  from: string;
}) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const importFile = async (
    file: File
  ): Promise<{
    message: string;
  }> => {
    try {
      setMessage("");
      const formData = new FormData();
      formData.append("file", file);

      let link;
      if (from === "Patrimoine") {
        link = `${import.meta.env.VITE_APP_API_URL}/ug/import-excel`;
      } else if (from === "Tiers") {
        link = `${import.meta.env.VITE_APP_API_URL}/tiers/import-excel`;
      }

      if (!link) {
        throw new Error("Invalid import type.");
      }

      const response = await customRequest.post(link, formData);

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

  const importFileMutation = useMutation({
    mutationFn: (data: File) => importFile(data),
    onSuccess: (data) => {
      setMessage(data.message);
    },
    onError: (error) => {
      console.error(error);
      setMessage(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFileMutation.mutate(file);
    }
  };

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 2,
        width: "100%",
      }}
    >
      <Button
        variant="contained"
        color={importFileMutation.isPending ? "secondary" : "primary"}
        onClick={handleButtonClick}
        disabled={importFileMutation.isPending}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textTransform: "none",
        }}
      >
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <Typography>
          {importFileMutation.isPending ? "Importation en cours..." : text}
        </Typography>
        <DownloadIcon />
      </Button>
      <Box sx={{ marginY: 2, display: "flex", alignItems: "center", gap: 2 }}>
        {importFileMutation.isSuccess && message && (
          <Typography sx={{ color: "success.main" }}>{message}</Typography>
        )}
        {importFileMutation.isError && message && (
          <Typography sx={{ color: "error.main" }}>{message}</Typography>
        )}
      </Box>
    </Box>
  );
}
