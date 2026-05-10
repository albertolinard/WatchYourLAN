import { allHosts, bkpHosts, Host, setAllHosts } from "./exports";

let oldFilter: keyof Host | "" = "";

export function filterFunc(field: keyof Host | "", value: any) {

  let addrsArray = allHosts;

  if (oldFilter == field) {
    addrsArray = bkpHosts();
  }
  oldFilter = field;

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