import Homme from "../../../assets/homme.png";
import Femme from "../../../assets/femme.png";
import { Box, Typography } from "@mui/material";

export default function SexeChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  let nbHommes = 0;
  let nbFemmes = 0;

  data.forEach((x) => {
    if (x.label === "M") {
      nbHommes = x.value;
    } else if (x.label === "F") {
      nbFemmes = x.value;
    }
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        marginY: 4,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 450,
          "& img": {
            filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.2))",
            transition: "transform 0.3s ease, filter 0.3s ease",
          },
          "&:hover img": {
            transform: "translateY(-10px)",
            filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.4))",
          },
          "&:hover .hoverable-text": {
            transform: "translateY(-10px)",
          },
        }}
      >
        <img
          src={Homme}
          alt="nombre d'hommes"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
        <Typography
          variant="h3"
          className="hoverable-text"
          color="white"
          sx={{
            position: "absolute",
            textAlign: "center",
            transition: "transform 0.3s ease",
            fontSize: "1rem",
          }}
        >
          {nbHommes}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 450,
          "& img": {
            filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.2))",
            transition: "transform 0.3s ease, filter 0.3s ease",
          },
          "&:hover img": {
            transform: "translateY(-10px)",
            filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.4))",
          },
          "&:hover .hoverable-text": {
            transform: "translateY(-10px)",
          },
        }}
      >
        <img
          src={Femme}
          alt="nombre de femmes"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
        <Typography
          className="hoverable-text"
          color="white"
          sx={{
            position: "absolute",
            textAlign: "center",
            transition: "transform 0.3s ease",
            fontSize: "1rem",
          }}
        >
          {nbFemmes}
        </Typography>
      </Box>
    </Box>
  );
}
