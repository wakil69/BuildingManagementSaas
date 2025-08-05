import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { Collapse } from "@mui/material";
import { useNavigate } from "react-router-dom";

const mainListItems = [
  {
    text: "Accueil",
    icon: <HomeRoundedIcon />,
    url: "accueil",
  },
  {
    text: "Patrimoine",
    icon: <ApartmentIcon />,
    subItems: [
      {
        text: "Visualiser",
        icon: <VisibilityIcon />,
        url: "patrimoine/recherche",
      },
      { text: "Créer", icon: <AddIcon />, url: "patrimoine/creer" },
      {
        text: "Importer avec excel",
        icon: <CloudDownloadIcon />,
        url: "patrimoine/importExcel",
      },
    ],
  },
  {
    text: "Bénéficiaires",
    icon: <EmojiPeopleIcon />,
    subItems: [
      { text: "Visualiser", icon: <VisibilityIcon />, url: "tiers/recherche?Formule=1&PM=true&PP=true" },
      { text: "Créer", icon: <AddIcon />, url: "tiers/creer" },
      {
        text: "Importer avec excel",
        icon: <CloudDownloadIcon />,
        url: "tiers/importExcel",
      },
    ],
  },
  {
    text: "Conventions",
    icon: <DescriptionIcon />,
    subItems: [
      {
        text: "Visualiser",
        icon: <VisibilityIcon />,
        url: "convention/recherche?type=PEPINIERE&active=true&resilie=true",
      },
      { text: "Créer", icon: <AddIcon />, url: "convention/creer" },
    ],
  },
  {
    text: "Statistiques",
    icon: <AnalyticsRoundedIcon />,
    url: "statistiques/bilans"
  },
];

const secondaryListItems = [
  { text: "Réglages", icon: <SettingsRoundedIcon /> },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const handleToggle = (index: number) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <div key={index}>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  if (item.text === "Accueil") {
                    navigate("/pageConnecte/accueil")
                  } else if (item.text === "Statistiques") {
                    navigate("/pageConnecte/statistiques/bilans")
                  } else {
                    handleToggle(index);
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems ? (
                  openItems[index] ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                ) : null}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse in={openItems[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem key={subIndex} sx={{ pl: 2 }}>
                      <ListItemButton
                        onClick={() => navigate(subItem.url)}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => navigate("/pageConnecte/administration/reglages")}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
