import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { authStorage } from "./auth-storage";

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(baseURL: string): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = authStorage.getRefreshToken();
    if (!refresh) return null;
    try {
      const resp = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        { refreshToken: refresh },
        { timeout: 10_000 },
      );
      const tokens = resp.data.tokens;
      authStorage.setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return tokens.accessToken as string;
    } catch {
      authStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function attachRefreshInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (resp) => resp,
    async (error) => {
      const original = error.config as (InternalAxiosRequestConfig & { __retry?: boolean }) | undefined;
      const status = error?.response?.status;

      if (!original || status !== 401 || original.__retry) {
        return Promise.reject(error);
      }
      // Don't try to refresh the refresh call itself
      if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }
      original.__retry = true;

      const newToken = await refreshTokens(instance.defaults.baseURL!);
      if (!newToken) {
        // surface a clear "session expired" error; app routes back to /login
        window.dispatchEvent(new CustomEvent("viacerta:session-expired"));
        return Promise.reject(error);
      }
      original.headers.set("Authorization", `Bearer ${newToken}`);
      return instance(original);
    },
  );
}
