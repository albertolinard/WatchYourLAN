import { createSignal, Show } from "solid-js";
import { editNames, selectedIDs, setSelectedIDs } from "../../functions/exports";
import { apiEditHost } from "../../functions/api";
import { vendorIcon } from "../../functions/vendor";
import { formatTimestamp } from "../../functions/format";
import { debounce } from "@solid-primitives/scheduled";

function DeviceCard(_props: any) {

  const [name, setName] = createSignal(_props.host.name);

  let onlineBadge = <span class="badge bg-secondary">Offline</span>;
  if (_props.host.online) {
    onlineBadge = <span class="badge bg-success">Online</span>;
  };

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

  const icon = vendorIcon(_props.host.vendor, _props.host.mac);
  const vendor = _props.host.vendor || "";

  return (
    <div class="col">
      <div class={`card h-100 ${_props.host.online ? 'border-success' : 'border-secondary'}`}>
        <div class="card-body">
          <div class="d-flex align-items-start mb-2 gap-2">
            <i class={`bi ${icon} fs-3 text-primary flex-shrink-0`}></i>
            <div class="flex-grow-1 overflow-hidden">
              <Show
                when={editNames()}
                fallback={<h6 class="card-title mb-0 text-truncate">{name() || "Unknown"}</h6>}
              >
                <input type="text" class="form-control form-control-sm" value={name()}
                  onInput={e => handleInput(e.target.value)}></input>
              </Show>
              <small class="text-muted">{_props.host.iface}</small>
            </div>
            <span class="flex-shrink-0">{onlineBadge}</span>
          </div>
          <div class="small">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">IP</span>
              <a href={"http://" + _props.host.ip} target="_blank">{_props.host.ip}</a>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">MAC</span>
              <span class="font-monospace small">{_props.host.mac}</span>
            </div>
            <Show when={vendor}>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Vendor</span>
                <span title={vendor}>{vendor.slice(0, 20)}</span>
              </div>
            </Show>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Known</span>
              <div class="form-check form-switch form-check-sm d-inline-block">
                <input class="form-check-input" type="checkbox" checked={!!_props.host.known}
                  onClick={handleToggle}></input>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
          <small class="text-muted">{formatTimestamp(_props.host.last_seen)}</small>
          <Show
            when={editNames()}
            fallback={
              <a href={"/host/" + _props.host.id} class="btn btn-sm btn-outline-primary">
                <i class="bi bi-three-dots"></i>
              </a>
            }
          >
            <input
              type="checkbox"
              class="form-check-input"
              checked={selectedIDs().includes(_props.host.id)}
              onChange={e => handleCheck((e.target as HTMLInputElement).checked)}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default DeviceCard
