import { apiGetAllHosts, apiGetScanState, apiGetStatus } from "./api";
import { allHosts, setAllHosts, setBkpHosts, setIfaces, setAppStat, setScanState } from "./exports";
import { filterAtStart, filterFunc } from "./filter";
import { sortAtStart } from "./sort";

export function runAtStart() {
  getHosts();
  getStats();
  getScanState();
  filterFunc("", 0); // reset filter

  setInterval(() => {
    getHosts();
    getStats();
  }, 60000); // 1 minute

  setInterval(() => {
    getScanState();
  }, 5000); // scan status should feel live
}

export async function getHosts() {
  const hosts = await apiGetAllHosts();

  if (hosts !== null && hosts.length > 0) {
    setAllHosts(hosts);
    setBkpHosts(hosts);

    listIfaces();
    sortAtStart();
    filterAtStart();
  }
}

export async function getStats() {
  const stat = await apiGetStatus();
  if (stat !== null) {
    setAppStat(stat);
  }
}

export async function getScanState() {
  const state = await apiGetScanState();
  if (state !== null) {
    setScanState(state);
  }
}

function listIfaces() {

  let ifaces: string[] = [];

  for (let host of allHosts) {
    if (host.iface && !ifaces.includes(host.iface)) {
      ifaces.push(host.iface);
    }
  }

  setIfaces(ifaces);
}
