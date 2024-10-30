import { refreshToken } from "@/lib/authActions";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const baseURL = process.env.NEXT_PUBLIC_BASE_API;

const useAxios = () => {
  const authTokens = JSON.parse(localStorage.getItem("authTokens") || "{}");
  const api = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${authTokens?.access}` },
  });

  api.interceptors.request.use(async (req) => {
    const decoded = jwtDecode(authTokens.access);
    const isExpired = decoded.exp || 0;
    const now = Date.now() / 1000;

    if (isExpired > now) return req;

    const newToken: any = await refreshToken(authTokens.refresh);

    if (newToken.mes != "OK") {
      throw new Error("Failed to refresh token");
    } else {
      localStorage.setItem("authTokens", JSON.stringify(newToken.token));
    }

    req.headers.Authorization = `Bearer ${newToken!.access}`;

    return req;
  });

  return api;
};
export default useAxios;
