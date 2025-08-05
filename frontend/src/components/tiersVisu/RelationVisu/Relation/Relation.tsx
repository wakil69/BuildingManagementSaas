import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
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
import { Company, Dirigeant } from "../../../../types/tiers/tiers";
import { convertDateFormat } from "../../../../utils/functions";
import EditIcon from "@mui/icons-material/Edit";
import { useRelationsPMPP } from "../../../../hooks/tiers/useRelations";
import AddRelationPP from "../AddRelationPP/AddRelationPP";
import AddRelationPM from "../AddRelationPM/AddRelationPM";
import OverlayRemoveRelation from "../overlayRemoveRelation/overlayRemoveRelation";
import OverlayEditRelation from "../overlayEditRelation/overlayEditRelation";

export default function RelationVisu({
  relations,
  qualite,
  id,
}: {
  relations: Company[] | Dirigeant[];
  qualite?: "PM" | "PP";
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { relationsPMPP } = useRelationsPMPP();
  const [isOpenDeleteRelation, setIsOpenDeleteRelation] = useState<
    number | null
  >(null);
  const [isOpenEditRelation, setIsOpenEditRelation] = useState<number | null>(
    null
  );

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
        <Typography variant="h6">
          {qualite === "PP" ? "Entreprises" : "Dirigeants"}
        </Typography>
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
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                marginTop: 3,
              }}
            >
              {qualite === "PP" ? (
                <AddRelationPP id={id} relations={relations} />
              ) : (
                <AddRelationPM id={id} relations={relations} />
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
                          {qualite === "PP" ? "Entreprise" : "Dirigeant"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Date de début
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Date de fin</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Relation</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Statut</Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relations.map((relation, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                        onClick={() => {
                          const targetUrl = `/pageConnecte/tiers/recherche/visualisation/${qualite === "PP" ? "PM" : "PP"}/${
                            qualite === "PP"
                              ? (relation as Company).tiepm_id
                              : (relation as Dirigeant).tiepp_id
                          }`;
                          window.open(targetUrl);
                        }}
                      >
                        <Dialog
                          open={isOpenDeleteRelation === relation.rel_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <DialogContent>
                            <OverlayRemoveRelation
                              setIsOpen={setIsOpenDeleteRelation}
                              qualite={qualite}
                              relation={relation}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isOpenEditRelation === relation.rel_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <DialogContent>
                            <OverlayEditRelation
                              setIsOpen={setIsOpenEditRelation}
                              qualite={qualite}
                              relation={relation}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <TableCell align="center">
                          <Typography>
                            {qualite === "PP"
                              ? (relation as Company).raison_sociale
                              : (relation as Dirigeant).libelle}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(
                              relation.relation_date_debut || ""
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(
                              relation.relation_date_fin || ""
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {
                              relationsPMPP.find(
                                (relationPMPP) =>
                                  relationPMPP.rel_typ_id ===
                                  relation.rel_typ_id
                              )?.name
                            }
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{relation.relation_status}</Typography>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpenEditRelation(relation.rel_id);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpenDeleteRelation(relation.rel_id);
                            }}
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
