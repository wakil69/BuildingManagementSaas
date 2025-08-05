import { Box } from "@mui/material";
import Authentication from "../../components/Authentication/Authentication";
import styles from "./Login.module.css";

function Login() {
  return (
      <Box className={styles.container}>
        <Authentication />
      </Box>
  );
}

export default Login;
