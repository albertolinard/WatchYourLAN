import { createSignal, Show } from "solid-js";
import { editNames, selectedIDs, setSelectedIDs } from "../../functions/exports";
import { apiEditHost } from "../../functions/api";
import { vendorIcon } from "../../functions/vendor";
import { formatTimestamp } from "../../functions/format";

import { debounce } from "@solid-primitives/scheduled";

function TableRow(_props: any) {

  const [name, setName] = createSignal(_props.host.name);

  let online = <i class="bi bi-circle-fill" style="color:var(--bs-gray-500);"></i>;
  if (_props.host.online) {
    online = <i class="bi bi-check-circle-fill" style="color:var(--bs-success);"></i>;
  };

  const icon = vendorIcon(_props.host.vendor, _props.host.mac);

  const debouncedApi = debounce(async (val: string) => {
    await apiEditHost(_props.host.id, val, false);
  }, 300);

  const handleInput = async (n: string) => {
    setName(n);
    debouncedApi(n);
  };
  const handleToggle = async () => {
    await apiEditHost(_props.host.id, name(), true);
  };

  const handleCheck = (checked: boolean) => {
    const id = _props.host.id;
    setSelectedIDs(prev => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter(item => item !== id);
      }
    });
  };

  const vendor = _props.host.vendor || "";

  return (
    <tr>
      <td class="opacity-50">{_props.index}.</td>
      <td>
        <Show
          when={editNames()}
          fallback={<><i class={`bi ${icon} text-primary me-1`}></i>{name()}</>}
        >
          <input type="text" class="form-control" value={name()}
            onInput={e => handleInput(e.target.value)}></input>
        </Show>
      </td>
      <td>{_props.host.iface}</td>
      <td><a href={"http://" + _props.host.ip} target="_blank">{_props.host.ip}</a></td>
      <td>{_props.host.mac}</td>
      <td title={vendor}>{vendor.length > 12 ? vendor.slice(0, 12) + ".." : vendor}</td>
      <td>{formatTimestamp(_props.host.last_seen)}</td>
      <td>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" checked={!!_props.host.known}
            onClick={handleToggle}></input>
        </div>
      </td>
      <td>{online}</td>
      <td>
        <Show
          when={editNames()}
          fallback={
          <a href={"/host/" + _props.host.id}>
            <i class="bi bi-three-dots-vertical my-btn p-2" title="More"></i>
          </a>}
        >
          <input
            type="checkbox"
            class="form-check-input"
            checked={selectedIDs().includes(_props.host.id)}
            onChange={e => handleCheck((e.target as HTMLInputElement).checked)}
          />
        </Show>
      </td>
    </tr>
  )
}

export default TableRow
