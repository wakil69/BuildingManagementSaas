import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import Logo from "../../assets/carcoLogo.png";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile/useProfile";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const navigate = useNavigate();
  const { profile } = useProfile()

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      throw Error("Erreur serveur, veuillez réessayer.");
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="logo entreprise"
          sx={{
            maxWidth: "100%",
            maxHeight: 80, // Limit the height for consistent sizing
            objectFit: "contain", // Keep the image ratio intact
          }}
        />
      </Box>

      <Divider />
      <MenuContent />
      <Stack
        direction="column"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {profile && <Box sx={{ width: "100%", textAlign: "left" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {profile.userInfos.first_name} {profile.userInfos.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {profile.userInfos.email}
          </Typography>
        </Box>}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 1,
            "&:hover": { backgroundColor: "action.hover" },
          }}
          onClick={handleLogout}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Déconnexion
          </Typography>
          <LogoutRoundedIcon fontSize="small" />
        </Box>
      </Stack>
    </Drawer>
  );
}
