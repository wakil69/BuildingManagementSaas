import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuButton from "../MaterialUtilities/components/MenuButton";
import ColorModeIconDropdown from "../../theme/ColorModeIconDropdown";
import { useProfile } from "../../hooks/useProfile/useProfile";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <MenuButton showBadge={profile?.checkNotifications} aria-label="Open notifications" onClick={() => navigate("/pageConnecte/notifications")}>
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
