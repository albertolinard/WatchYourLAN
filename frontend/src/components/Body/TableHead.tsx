import { createSignal, For } from "solid-js";
import { Host } from "../../functions/exports";
import { sortByAnyField } from "../../functions/sort";

type Column = { key: keyof Host; label: string };

const columns: Column[] = [
  { key: "name",      label: "Name" },
  { key: "iface",     label: "Iface" },
  { key: "ip",        label: "IP" },
  { key: "mac",       label: "MAC" },
  { key: "vendor",    label: "Vendor" },
  { key: "last_seen", label: "Last seen" },
  { key: "known",     label: "Known" },
  { key: "online",    label: "On" },
];

function TableHead() {
  const [sortField, setSortField] = createSignal<string>(localStorage.getItem("sortField") || "");

  const handleSort = (key: keyof Host) => {
    setSortField(key);
    sortByAnyField(key);
  };

  return (
    <thead>
      <tr>
        <th style="width: 2em;"></th>
        <For each={columns}>{(c) =>
          <th
            style={c.key === sortField() ? "color: var(--bs-primary);" : ''}
          >{c.label} <i
            class="bi bi-sort-down-alt my-btn"
            onClick={[handleSort, c.key]}
            title={"Sort by " + c.label}
          ></i></th>
        }</For>
        <th style="width: 2em;" title="Edit"><i class="bi bi-pencil-fill"></i></th>
      </tr>
    </thead>
  )
}

export default TableHead
