import { Box } from "@mui/material";
import styles from "./Login.module.css";
import ResetPassword from "../../components/Authentication/ResetPassword/ResetPassword";

function ResetPasswordPage() {
  return (
      <Box className={styles.container}>
        <ResetPassword />
      </Box>
  );
}

export default ResetPasswordPage;
