import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PrixVisu from "../../components/Administration/Prix/Prix";
import ActionCollectiveVisu from "../../components/Administration/ActionCollective/ActionCollective";
import LegalFormVisu from "../../components/Administration/LegalForms/LegalForm/LegalForm";
import MotifsSortiePepVisu from "../../components/Administration/MotifsSortiePep/MotifsSortiePep/MotifsSortiePep";
import NatureEqVisu from "../../components/Administration/NatureEq/NatureEq/NatureEq";
import { useEffect } from "react";
import NatureUgVisu from "../../components/Administration/NatureUg/NatureUg/NatureUg";
import PrescribersVisu from "../../components/Administration/Prescribers/Prescribers/Prescribers";
import RelationsPMPPVisu from "../../components/Administration/RelationsPMPP/RelationPMPP/relationPMPP";
import SituationBeforePrjVisu from "../../components/Administration/SituationBeforePrj/SituationBeforePrj/SituationBeforePrj";
import StatutsPostPepVisu from "../../components/Administration/StatutsPostPep/StatutPostPep/StatutPostPep";
import SujetsVisu from "../../components/Administration/Sujets/Sujets/Sujets";
import AccountsVisu from "../../components/Administration/Accounts/Accounts/Accounts";
import EducationVisu from "../../components/Administration/Education/Education/Education";
import SecteursActivitesVisu from "../../components/Administration/SecteursActivites/SecteursActivites/SecteursActivites";

export default function Admin() {
  const navigate = useNavigate();

  // FOR LATER WHEN I WILL DO THE SETTINGS FOR PARAMETERS: add id to the element and as dependencies the isLoading
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        gap: 6,
        width:"100%",
      }}
    >
      <Button
        variant="contained"
        color="info"
        onClick={() =>
          navigate("/pageConnecte/administration/reglages/historique")
        }
      >
        Voir historique des prix
      </Button>
      <PrixVisu />
      <NatureUgVisu />
      <NatureEqVisu />
      <RelationsPMPPVisu />
      <SituationBeforePrjVisu />
      <SecteursActivitesVisu />
      <SujetsVisu />
      <ActionCollectiveVisu />
      <LegalFormVisu />
      <EducationVisu />
      <PrescribersVisu />
      <MotifsSortiePepVisu />
      <StatutsPostPepVisu />
      <AccountsVisu />
    </Box>
  );
}
