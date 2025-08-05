import { useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import AddActionCollective from "./AddActionCollective/AddActionCollective";
import CollapsibleActionCollective from "./CollapsibleActionCollective.tsx/CollapsibleActionCollective";
import { useQuery } from "@tanstack/react-query";
import customRequest from "../../../routes/api/api";
import { ActionCollective } from "../../../types/Admin/Administration";
import { useTypesAcc } from "../../../hooks/tiers/useTypesAcc";

export default function ActionCollectiveVisu() {
  async function getActionCollective(): Promise<ActionCollective[]> {
    try {
      const link = `${
        import.meta.env.VITE_APP_API_URL
      }/admin/action-collective`;
      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: actionsCollectives, isLoading: isLoadingActionCollectives } =
    useQuery({
      queryKey: ["actions_collectives"],
      queryFn: getActionCollective,
      refetchOnWindowFocus: false,
    });

  const [isOpen, setIsOpen] = useState(false);

  const { typesAcc } = useTypesAcc();

  const actionCollectiveID = useMemo(() => {
    return typesAcc.find((typeAcc) => typeAcc.name === "ACTION COLLECTIVE")
      ?.typ_accompagnement_id;
  }, [typesAcc]);

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
        <Typography variant="h6">Actions collectives</Typography>
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
              <AddActionCollective actionCollectiveID={actionCollectiveID} />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
              }}
            >
              {actionsCollectives ? (
                actionsCollectives.map((actionCollective) => {
                  return (
                    <CollapsibleActionCollective
                      key={actionCollective.sujet_accompagnement_id}
                      actionCollective={actionCollective}
                    />
                  );
                })
              ) : isLoadingActionCollectives ? (
                <CircularProgress size={12} />
              ) : null}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
