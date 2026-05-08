import { apiPath } from "./api";

export interface UptimePoint {
  time: string;
  online: number;
}

export const apiGetUptime = async (rangeHours: number = 24): Promise<UptimePoint[]> => {
  try {
    const url = `${apiPath}/api/influx/uptime?range=${rangeHours}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};