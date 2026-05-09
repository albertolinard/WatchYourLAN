import { allHosts, bkpHosts, Host, setAllHosts } from "./exports";

let oldFilter: keyof Host | "" = "";

export function filterAtStart() {
  const field = (localStorage.getItem("filterField") || "") as keyof Host;
  const raw = localStorage.getItem("filterValue");
  const value: any = raw === "true" ? true : raw === "false" ? false : raw;

  filterFunc(field, value);
}

export function filterFunc(field: keyof Host | "", value: any) {

  let addrsArray = allHosts;

  if (oldFilter == field) {
    addrsArray = bkpHosts();
  }
  oldFilter = field;

  if (field) localStorage.setItem("filterField", field);
  localStorage.setItem("filterValue", String(value));

  switch (field) {
    case 'iface':
      addrsArray = addrsArray.filter((item) => item.iface == value);
      break;
    case 'known':
      addrsArray = addrsArray.filter((item) => String(item.known) == String(value));
      break;
    case 'online':
      addrsArray = addrsArray.filter((item) => String(item.online) == String(value));
      break;
    default:
      addrsArray = bkpHosts();
  }

  setAllHosts(addrsArray);
}
