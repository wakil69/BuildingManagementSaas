import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth/useAuth";
import { BounceLoader } from "react-spinners";
import { HeaderProvider } from "./headerContext";
import AppTheme from "../theme/AppTheme/AppTheme";
import {
  alpha,
  Box,
  CssBaseline,
  LinearProgress,
  linearProgressClasses,
  Stack,
} from "@mui/material";
import SideMenu from "../components/SideMenu/SideMenu";
import AppNavbar from "../components/MaterialUtilities/components/AppNavbar";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../components/MaterialUtilities/theme/customizations";
import { lazy, Suspense } from "react";
import ResetPasswordPage from "../pages/ResetPassword/page";
import VisualisationTiersPage from "../pages/visualisationTiers/page";

const Login = lazy(() => import("../pages/Login/page"));
const Header = lazy(() => import("../components/Header/Header"));
const Notifications = lazy(() => import("../pages/Notifications/page"));
const Admin = lazy(() => import("../pages/Administration/page"));
const RechercheUG = lazy(() => import("../pages/RechercheUG/RechercheUG"));
const VisualisationUGPage = lazy(() => import("../pages/VisualisationUG/page"));

// const VisualisationTiersPage = lazy( # not set lazy because it does not work if i open new tab
//   () => import("../pages/visualisationTiers/page")
// );

const VisualisationConventionPage = lazy(
  () => import("../pages/visualisationConv/page")
);
const CreationUgPage = lazy(() => import("../pages/CreationUG/page"));
const CreationUGImportExcel = lazy(
  () => import("../pages/CreationUGExcel/page")
);
const Historique = lazy(
  () => import("../components/Administration/Prix/Historique/Historique")
);
const CreationTiersPage = lazy(() => import("../pages/CreationTiers/page"));
const CreationTiersImportExcel = lazy(
  () => import("../pages/CreationTiersExcel/page")
);
const RechercheTiers = lazy(() => import("../pages/RechercheTiers/page"));
const RechercheConventions = lazy(
  () => import("../pages/RechercheConvention/page")
);
const CreationConventionPage = lazy(() => import("../pages/CreationConv/page"));
const StatsOverallPage = lazy(() => import("../pages/StatsOverall/page"));
const BilanStatsPage = lazy(() => import("../pages/BilanStats/page"));

function RedirectLoginToMenu({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BounceLoader color="black" size={12} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/pageConnecte/accueil" />;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BounceLoader color="black" size={12} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const renderFallback = (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    flex="1 1 auto"
  >
    <LinearProgress
      sx={{
        width: 1,
        [`& .${linearProgressClasses.bar}`]: { bgcolor: "text.primary" },
      }}
    />
  </Box>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={renderFallback}>
        <RedirectLoginToMenu>
          <AppTheme>
            <CssBaseline enableColorScheme />
            <Login />
          </AppTheme>
        </RedirectLoginToMenu>
      </Suspense>
    ),
  },
  {
    path: "/reset-pwd/:token",
    element: (
      <Suspense fallback={renderFallback}>
        <RedirectLoginToMenu>
          <AppTheme>
            <CssBaseline enableColorScheme />
            <ResetPasswordPage />
          </AppTheme>
        </RedirectLoginToMenu>
      </Suspense>
    ),
  },
  {
    path: "/pageConnecte",
    element: (
      <Suspense fallback={renderFallback}>
        <ProtectedRoute>
          <HeaderProvider>
            <AppTheme themeComponents={xThemeComponents}>
              <CssBaseline enableColorScheme />
              <Box sx={{ display: "flex" }}>
                <SideMenu />
                <AppNavbar />
                <Box
                  component="main"
                  sx={(theme) => ({
                    flexGrow: 1,
                    backgroundColor: alpha(theme.palette.background.default, 1),
                    overflow: "auto",
                  })}
                >
                  <Stack
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      mx: 3,
                      pb: 5,
                      mt: { xs: 8, md: 0 },
                    }}
                  >
                    <Header />
                    <Suspense fallback={renderFallback}>
                      <Outlet />
                    </Suspense>
                  </Stack>
                </Box>
              </Box>
            </AppTheme>
          </HeaderProvider>
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      {
        path: "accueil",
        element: <StatsOverallPage />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "administration/reglages",
        element: <Admin />,
      },
      {
        path: "administration/reglages/historique",
        element: <Historique />,
      },
      {
        path: "patrimoine/recherche",
        element: <RechercheUG />,
      },
      {
        path: "patrimoine/recherche/visualisation/:ugId",
        element: <VisualisationUGPage />,
      },
      {
        path: "patrimoine/creer",
        element: <CreationUgPage />,
      },
      {
        path: "patrimoine/importExcel",
        element: <CreationUGImportExcel />,
      },
      {
        path: "tiers/recherche",
        element: <RechercheTiers />,
      },
      {
        path: "tiers/recherche/visualisation/:qualite/:id",
        element: <VisualisationTiersPage />,
      },
      {
        path: "tiers/creer",
        element: <CreationTiersPage />,
      },
      {
        path: "tiers/importExcel",
        element: <CreationTiersImportExcel />,
      },
      {
        path: "convention/recherche",
        element: <RechercheConventions />,
      },
      {
        path: "convention/recherche/visualisation/:convId/:version",
        element: <VisualisationConventionPage />,
      },
      {
        path: "convention/creer",
        element: <CreationConventionPage />,
      },
      {
        path: "statistiques/bilans",
        element: <BilanStatsPage />,
      },
    ],
  },
]);
