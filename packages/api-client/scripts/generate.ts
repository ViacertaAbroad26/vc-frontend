#!/usr/bin/env tsx
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import openapiTS, { type OpenAPI3 } from "openapi-typescript";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

const BANNER = `// AUTO-GENERATED — DO NOT EDIT
// Source: ViaCerta backend OpenAPI specs (merged)
// Regenerate: pnpm --filter @viacerta/api-client run generate
`;

async function fetchSpec(url: string): Promise<Record<string, unknown>> {
  process.stdout.write(`Fetching ${url}... `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const json = (await res.json()) as Record<string, unknown>;
  process.stdout.write("done\n");
  return json;
}

async function main() {
  const [portalSpec, advisorSpec] = await Promise.all([
    fetchSpec(`${BACKEND}/openapi.json`),
    fetchSpec(`${BACKEND}/advisor/openapi.json`),
  ]);

  const portalComponents = (portalSpec.components ?? {}) as Record<string, unknown>;
  const advisorComponents = (advisorSpec.components ?? {}) as Record<string, unknown>;

  // Merge the two specs into a single schema covering both audiences, since
  // apps/web is one app/one deploy and needs one typed client.
  const merged = {
    ...portalSpec,
    paths: {
      ...(portalSpec.paths as Record<string, unknown>),
      ...(advisorSpec.paths as Record<string, unknown>),
    },
    components: {
      ...portalComponents,
      ...advisorComponents,
      schemas: {
        ...(portalComponents.schemas as Record<string, unknown>),
        ...(advisorComponents.schemas as Record<string, unknown>),
      },
    },
  } as unknown as OpenAPI3;

  const output = await openapiTS(merged, { exportType: true });
  const out = "src/generated/api.d.ts";
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, BANNER + output, "utf8");
  console.log("✓ Generated merged API types");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
