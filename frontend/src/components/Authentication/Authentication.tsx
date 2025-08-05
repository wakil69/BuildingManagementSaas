import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import Logo from "../../assets/Logo.png";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";

interface SignInInputs {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Veuillez entrer une adresse email valide.")
    .required("L'email est requis"),
  password: Yup.string().required("Le mot de passe est requis."),
});

function Authentication() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInputs>({
    resolver: yupResolver(validationSchema),
  });

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [message, setMessage] = useState("");

  const logIn = async (data: SignInInputs) => {
    try {
      setMessage("");

      const response = await customRequest.post(`/users/login`, data);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
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

  const logInMutation = useMutation({
    mutationFn: (data: SignInInputs) => logIn(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate("/pageConnecte/accueil");
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "450px",
    },
    boxShadow:
      "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    ...theme.applyStyles("dark", {
      boxShadow:
        "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
  }));

  const SignInContainer = styled(Stack)(({ theme }) => ({
    height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
    minHeight: "100%",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(4),
    },
    "&::before": {
      content: '""',
      display: "block",
      position: "absolute",
      zIndex: -1,
      inset: 0,
      backgroundImage:
        "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
      backgroundRepeat: "no-repeat",
      ...theme.applyStyles("dark", {
        backgroundImage:
          "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
      }),
    },
  }));

  const currentYear = new Date().getFullYear();

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <img src={Logo} alt="XXXXXXX" style={{ width: "100%" }} />
        <Box
          component="form"
          onSubmit={handleSubmit((data) => logInMutation.mutate(data))}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField {...register("email")} fullWidth variant="outlined" type="email" />
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.email && <Typography>{errors.email.message}</Typography>}
            </Box>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Mot de passe</FormLabel>
            <TextField {...register("password")} fullWidth variant="outlined" type="password" />
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.password && (
                <Typography>{errors.password.message}</Typography>
              )}
            </Box>
          </FormControl>
          <ForgotPassword open={open} handleClose={handleClose} />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={logInMutation.isPending}
          >
            Se connecter
          </Button>
          <Box
            sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}
          >
            {logInMutation.isSuccess && message && (
              <Typography sx={{ color: "success.main" }}>{message}</Typography>
            )}
            {logInMutation.isError && message && (
              <Typography sx={{ color: "error.main" }}>{message}</Typography>
            )}
          </Box>
          <Link
            component="button"
            type="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            Mot de passe oublié ?
          </Link>
        </Box>
      </Card>
      <Typography
        component="h3"
        variant="h4"
        sx={{
          width: "100%",
          fontSize: "1.3rem",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textAlign: "center",
          background: "#194056",
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          marginY: "1.5rem",
          paddingY: "0.5rem",
        }}
      >
        XXXXX © {currentYear} - Un produit conçu par{" "}
        <a
          href="https://mbe-consult.fr/fr"
          target="_blank"
          rel="noopener noreferrer"
        >
          MBE & CONNECT
        </a>
      </Typography>
    </SignInContainer>
  );
}

export default Authentication;
