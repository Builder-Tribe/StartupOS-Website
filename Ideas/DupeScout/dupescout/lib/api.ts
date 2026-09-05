import axios from "axios";
import type { ApiResponse, VisualSearchRequest, VisualSearchResult, Product, TrendCard, User } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const client = axios.create({
  baseURL: `${BASE}/api/v1`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request (consumer realm)
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ds_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Visual Search ────────────────────────────────────────────────────────────

export async function visualSearch(req: VisualSearchRequest): Promise<ApiResponse<VisualSearchResult>> {
  const { data } = await client.post<ApiResponse<VisualSearchResult>>("/search/visual", req);
  return data;
}

export async function searchByUrl(url: string): Promise<ApiResponse<VisualSearchResult>> {
  return visualSearch({ url });
}

export async function searchByQuery(query: string): Promise<ApiResponse<VisualSearchResult>> {
  return visualSearch({ query });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const { data } = await client.get<ApiResponse<Product>>(`/products/${id}`);
  return data;
}

// ─── Discovery ────────────────────────────────────────────────────────────────

export async function getTrending(): Promise<ApiResponse<TrendCard[]>> {
  const { data } = await client.get<ApiResponse<TrendCard[]>>("/discovery/trending");
  return data;
}

export async function getRecommendations(): Promise<ApiResponse<Product[]>> {
  const { data } = await client.get<ApiResponse<Product[]>>("/discovery/recommendations");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<ApiResponse<{ message: string; ttl_seconds: number }>> {
  const { data } = await client.post("/auth/otp/send", { phone });
  return data;
}

export interface VerifyOtpResult {
  token: string;
  is_new_user: boolean;
  user: User;
}

export async function verifyOtp(phone: string, otp: string): Promise<ApiResponse<VerifyOtpResult>> {
  const { data } = await client.post("/auth/otp/verify", { phone, otp });
  return data;
}

export async function getMe(): Promise<ApiResponse<User>> {
  const { data } = await client.get<ApiResponse<User>>("/auth/me");
  return data;
}

// ─── Image → base64 helper ────────────────────────────────────────────────────

// ─── Compare API ─────────────────────────────────────────────────────────────

export async function compareProducts(product_ids: string[]): Promise<ApiResponse<any>> {
  const { data } = await client.post("/consumer/compare", { product_ids });
  return data;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
