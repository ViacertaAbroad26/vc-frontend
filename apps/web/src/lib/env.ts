import { baseEnvSchema, createEnv } from "@viacerta/utils";
import { z } from "zod";

const portalEnvSchema = baseEnvSchema.extend({
  VITE_PARENT_FLOW_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const env = createEnv(portalEnvSchema, import.meta.env);
