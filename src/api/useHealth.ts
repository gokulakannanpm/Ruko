import { useState, useEffect } from "react";
import type { HealthResponse } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000";

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse>({
    status: "ok",
    schema_version: "1.0",
    ai_enabled: false,
    features: {
      image_input: false,
    },
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data: HealthResponse) => {
        if (data && data.status === "ok") {
          setHealth(data);
        }
      })
      .catch(() => {
        // Retain default safe offline/unreachable structure
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { health, loading };
}
