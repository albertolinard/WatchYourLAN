import { allHosts, bkpHosts, Host, setAllHosts } from "./exports";

export function searchFunc(s: string) {

  if (s != "") {
    const sl = s.toLowerCase();
    let newArray: Host[] = [];

    for (let item of allHosts) {
      if (searchItem(item, sl)) {
        newArray.push(item);
      }
    }

    setAllHosts(newArray);
  } else {
    setAllHosts(bkpHosts());
  }
}

function searchItem(item: Host, sl: string) {
  const name   = (item.name   || "").toLowerCase();
  const vendor = (item.vendor || "").toLowerCase();
  const mac    = (item.mac    || "").toLowerCase();
  const iface  = (item.iface  || "").toLowerCase();
  const ip     = (item.ip     || "").toLowerCase();
  const last   = (item.last_seen || "").toLowerCase();

  return (
    name.includes(sl)   ||
    iface.includes(sl)  ||
    ip.includes(sl)     ||
    mac.includes(sl)    ||
    vendor.includes(sl) ||
    last.includes(sl)
  );
}
