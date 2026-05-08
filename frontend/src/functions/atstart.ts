import { apiGetAllHosts, apiGetStatus } from "./api";
import { allHosts, setAllHosts, setBkpHosts, setIfaces, setAppStat } from "./exports";
import { filterAtStart, filterFunc } from "./filter";
import { sortAtStart } from "./sort";

export function runAtStart() {
  getHosts();
  getStats();
  filterFunc("ID", 0); // reset filter

  setInterval(() => {
    getHosts();
    getStats();
  }, 60000); // 60000 ms = 1 minute
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

function listIfaces() {

  let ifaces:string[] = [];

  for (let host of allHosts) {
    if (!ifaces.includes(host.Iface)) {
      ifaces.push(host.Iface);
    }
  }

  setIfaces(ifaces);
}