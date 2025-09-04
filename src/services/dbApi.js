// src/services/dbApi.js
import api from "@/apiClient";

// 获取站点列表
export async function fetchSites() {
  try {
    const res = await api.get("/api/sites");
    return res.data; // axios 自动解析 JSON
  } catch (err) {
    console.error("fetchSites failed:", err);
    throw new Error("fetch_sites_failed");
  }
}
