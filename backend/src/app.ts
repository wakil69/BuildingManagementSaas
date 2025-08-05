import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { adminRouter } from "./routers/adminRouter";
import { userRouter } from "./routers/userRouter";
import { tiersRouter } from "./routers/tiers/tiersRouter";
import { ugRouter } from "./routers/ugRouter";
import { convRouter } from "./routers/convRouter";
import { docsRouter } from "./routers/docs/docsRouter";
import { runLatestMigrations } from "./data/db";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";

import dotenv from "dotenv";
import { propertiesTiersRouter } from "./routers/tiers/PropertiesRouter";
import { suiviTiersRouter } from "./routers/tiers/SuiviTiersRouter";
import { createTiersRouter } from "./routers/tiers/createTiers";
import { charteAndRulesRouter } from "./routers/docs/docsCharteAndReglement";
import { overallStatsRouter } from "./routers/statistics/overallStats";
import { bilanFormulesRouter } from "./routers/statistics/BilanFormules";
import { statsRouter } from "./routers/statistics/statsRouter";
import { BilanGraphsRouter } from "./routers/statistics/bilanGraphs";
dotenv.config();

const app = express();

const origin =
  process.env.NODE_ENVIRONNEMENT === "production"
    ? "https://test.com"
    : "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.use("/users", userRouter);
app.use("/tiers", tiersRouter);
app.use("/tiers", propertiesTiersRouter);
app.use("/tiers", suiviTiersRouter);
app.use("/tiers", createTiersRouter);
app.use("/ug", ugRouter);
app.use("/convention", convRouter);
app.use("/admin", adminRouter);
app.use("/docs", docsRouter);
app.use("/docs", charteAndRulesRouter)
app.use('/stats', statsRouter);
app.use('/stats', overallStatsRouter);
app.use('/stats', bilanFormulesRouter);
app.use('/stats', BilanGraphsRouter)

if (process.env.NODE_ENVIRONNEMENT !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
}

const PORT = 8080;
app.listen(PORT, async () => {
  await runLatestMigrations();
  console.log(`Server is running on port ${PORT}!`);
});

export default app;
