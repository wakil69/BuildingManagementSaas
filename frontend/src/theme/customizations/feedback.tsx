import { Theme, Components } from "@mui/material/styles";
import { gray } from "../themePrimitives";

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ ownerState }) => ({
        ...(ownerState.severity === "error" &&
          ownerState.variant === "standard" && {
            backgroundColor: "#FCEBE9",
            color: "#751A0C",
          }),
        ...(ownerState.severity === "warning" &&
          ownerState.variant === "standard" && {
            backgroundColor: "#FFF6E5",
            color: "#93541B",
          }),
        ...(ownerState.severity === "info" &&
          ownerState.variant === "standard" && {
            backgroundColor: "#E5F3FB",
            color: "#004B6F",
          }),
        ...(ownerState.severity === "success" &&
          ownerState.variant === "standard" && {
            backgroundColor: "#E6F9ED",
            color: "#006730",
          }),
      }),
      icon: ({ ownerState }) => ({
        ...(ownerState.severity === "error" &&
          ownerState.variant === "standard" && {
            color: "grey",
          }),
        ...(ownerState.severity === "warning" &&
          ownerState.variant === "standard" && {
            color: "#FFAD00",
          }),
        ...(ownerState.severity === "info" &&
          ownerState.variant === "standard" && {
            color: "#008EDB",
          }),
        ...(ownerState.severity === "success" &&
          ownerState.variant === "standard" && {
            color: "#0EC54F",
          }),
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiDialog-paper": {
          borderRadius: "10px",
          border: "1px solid",
          borderColor: theme.palette.divider,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles("dark", {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};
