import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { Projet } from "../../../../types/tiers/tiers";
import CollapsibleProjet from "./CollapsibleProjet.tsx/CollapsibleProjet";
import AddProjet from "../AddProjet/AddProjet";

export default function ProjetsVisu({
  projets,
  id,
}: {
  projets: Projet[];
  qualite?: "PM" | "PP";
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

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
        <Typography variant="h6">Projets</Typography>
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
                gap: 3,
                marginTop: 3,
              }}
            >
              <AddProjet id={id} />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
              }}
            >
              {projets.map((projet) => {
                return <CollapsibleProjet projet={projet} id={id} />;
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
