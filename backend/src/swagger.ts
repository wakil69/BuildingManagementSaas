import swaggerAutogen from "swagger-autogen";
import { adminSchemas } from "./schemas/adminSchema";
import { userSchemas } from "./schemas/userSchema";
import { ugSchema } from "./schemas/ugSchema";
import { tiersSchema } from "./schemas/tiersSchema";
import { conventionSchema } from "./schemas/conventionSchema";

const doc = {
  info: {
    version: "v1.0.0",
    title: "Building Management Saas v2",
    description: "Routes",
  },
  servers: [
    {
      url: "http://localhost:8080"
      description: "",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      ...ugSchema,
      ...userSchemas,
      ...adminSchemas,
      ...tiersSchema,
      ...conventionSchema,
      BadRequest: {
        type: "object",
        properties: {
          description: "Bad request",
          message: { type: "string" },
        },
      },
      BadRequestFiles: {
        type: "object",
        properties: {
          description: "Bad request Files",
          message: { type: "string" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          description: "Success",
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          description: "Server error",
          message: { type: "string" },
        },
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./app.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
