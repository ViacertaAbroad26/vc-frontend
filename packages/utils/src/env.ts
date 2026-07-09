import { type ZodType, z } from "zod";

/**
 * Base shape shared by both apps' env files. Each app extends this with
 * its own additional vars and calls `createEnv` against `import.meta.env`.
 * Boot fails loudly (throws) if env is wrong — preferred over runtime
 * surprises deep in a query hook.
 */
export const baseEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_SENTRY_DSN: z.string().optional(),
});

export function createEnv<T extends ZodType>(schema: T, source: unknown): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
