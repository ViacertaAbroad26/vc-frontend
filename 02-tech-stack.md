# 02 — Tech Stack

## Versions (pin these)

### Root `package.json`

```json
{
  "devDependencies": {
    "typescript": "^5.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.29.0",
    "eslint-plugin-jsx-a11y": "^6.8.0"
  }
}
```

### `apps/portal/package.json`

```json
{
  "name": "@viacerta/portal",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.28.0",
    "@tanstack/react-query-devtools": "^5.28.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "axios": "^1.6.7",
    "recharts": "^2.12.0",
    "lucide-react": "^0.358.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@viacerta/ui": "workspace:*",
    "@viacerta/api-client": "workspace:*",
    "@viacerta/design-tokens": "workspace:*",
    "@viacerta/utils": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.4.0",
    "@vitest/ui": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "msw": "^2.2.0",
    "jsdom": "^24.0.0",
    "@playwright/test": "^1.42.0"
  }
}
```

`apps/advisor/package.json` is identical except for `name` and may pull a few extra deps if needed (heavier tables — `@tanstack/react-table` v8 if you find Recharts insufficient).

### `packages/ui/package.json`

```json
{
  "name": "@viacerta/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "dependencies": {
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.358.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-label": "^2.0.2",
    "@viacerta/design-tokens": "workspace:*",
    "@viacerta/utils": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.4.0",
    "@testing-library/react": "^14.2.0"
  }
}
```

### `packages/api-client/package.json`

```json
{
  "name": "@viacerta/api-client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./portal": "./src/portal.ts",
    "./advisor": "./src/advisor.ts",
    "./errors": "./src/errors.ts"
  },
  "scripts": {
    "generate": "tsx scripts/generate.ts",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "openapi-typescript": "^6.7.5",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
```

### `packages/design-tokens/package.json`

```json
{
  "name": "@viacerta/design-tokens",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
```

## Vite config (per app)

```ts
// apps/portal/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
```

`apps/advisor/vite.config.ts` differs only in `server.port: 5174`.

## tsconfig per app

```json
// apps/portal/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// apps/portal/tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## ESLint root config

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "detect" } },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  rules: {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],
    "no-restricted-imports": ["error", {
      patterns: [
        { "group": ["axios"], "message": "Use @viacerta/api-client instead of raw axios" }
      ]
    }]
  },
  overrides: [
    {
      files: ["apps/portal/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": ["error", {
          patterns: [
            { "group": ["@viacerta/api-client/advisor"],
              "message": "Portal cannot import advisor API client" }
          ]
        }]
      }
    },
    {
      files: ["apps/advisor/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": ["error", {
          patterns: [
            { "group": ["@viacerta/api-client/portal"],
              "message": "Advisor cannot import portal API client" }
          ]
        }]
      }
    }
  ]
};
```

## Tailwind config

Both apps use the same preset from `@viacerta/design-tokens`:

```ts
// apps/portal/tailwind.config.ts
import type { Config } from "tailwindcss";
import preset from "@viacerta/design-tokens/tailwind-preset";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [preset],
} satisfies Config;
```

`packages/design-tokens/src/tailwind-preset.ts` defines the actual theme — see `docs/03-design-system.md`.

## What we don't use

| Tool | Why not |
|---|---|
| Next.js | We don't need SSR; the backend has its own deploy. SPA is simpler. |
| Redux Toolkit | TanStack Query + Zustand covers our state needs with less boilerplate. |
| Material UI | Wrong aesthetic for ViaCerta; Tailwind + Radix gives us tighter control. |
| styled-components / emotion | Tailwind is simpler and more performant. |
| Formik | react-hook-form has better perf and DX. |
| SWC / Bun | Vite + ESBuild is fast enough; team familiarity skews esbuild. |
| Storybook (MVP) | Add in Phase 2 if the component library grows. |
| LangChain UI / Vercel AI SDK | We don't have streaming AI surfaces in the frontend. |

## Local dev requirements

- Node 20 (managed via `.nvmrc` + nvm/volta)
- pnpm 8
- Backend running at `http://localhost:8000` (so codegen can hit the OpenAPI endpoints)

## Env vars (per app)

### `apps/portal/.env.example`

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=ViaCerta Portal
VITE_PARENT_FLOW_ENABLED=true
VITE_SENTRY_DSN=
```

### `apps/advisor/.env.example`

```dotenv
VITE_API_BASE_URL=http://localhost:8000/advisor
VITE_APP_NAME=ViaCerta Advisor
VITE_SENTRY_DSN=
```

Both validated at boot via zod in `src/lib/env.ts`:

```ts
import { z } from "zod";

const Schema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_PARENT_FLOW_ENABLED: z.coerce.boolean().default(false),
  VITE_SENTRY_DSN: z.string().optional(),
});

export const env = Schema.parse(import.meta.env);
```

Boot fails loudly if env is wrong — preferred over runtime surprises.
