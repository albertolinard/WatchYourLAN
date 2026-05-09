import { apiGetEvents, apiGetEventsByDate } from "./api";
import { HostEvent } from "./exports";

export async function getHistoryForMac(mac: string, date: string): Promise<HostEvent[]> {
    let h: HostEvent[] = [];
    if (date === "") {
        h = await apiGetEvents(mac);
    } else {
        h = await apiGetEventsByDate(mac, date);
    }

    if (h != null) {
        h.sort((a: HostEvent, b: HostEvent) => (a.ts < b.ts ? 1 : -1));
        return h;
    }
    return [];
}
