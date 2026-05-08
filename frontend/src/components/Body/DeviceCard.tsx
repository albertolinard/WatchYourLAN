import { createSignal, Show } from "solid-js";
import { editNames, selectedIDs, setSelectedIDs } from "../../functions/exports";
import { apiEditHost } from "../../functions/api";
import { vendorIcon } from "../../functions/vendor";
import { debounce } from "@solid-primitives/scheduled";

function DeviceCard(_props: any) {

  const [name, setName] = createSignal(_props.host.Name);

  let now = <span class="badge bg-secondary">Offline</span>;
  if (_props.host.Now == 1) {
    now = <span class="badge bg-success">Online</span>;
  };

  const debouncedApi = debounce(async (val: string) => {
    await apiEditHost(_props.host.ID, val, "");
  }, 300);

  const handleInput = async (n: string) => {
    setName(n);
    debouncedApi(n);
  };

  const handleToggle = async () => {
    await apiEditHost(_props.host.ID, name(), "toggle");
  };

  const handleCheck = (checked: boolean) => {
    const id = _props.host.ID;
    setSelectedIDs(prev => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter(item => item !== id);
      }
    });
  };

  const icon = vendorIcon(_props.host.Hw, _props.host.Mac);

  return (
    <div class="col">
      <div class={`card h-100 ${_props.host.Now == 1 ? 'border-success' : 'border-secondary'}`}>
        <div class="card-body">
          <div class="d-flex align-items-start mb-2">
            <i class={`bi ${icon} fs-3 me-2 text-primary`}></i>
            <div class="flex-grow-1">
              <Show
                when={editNames()}
                fallback={<h6 class="card-title mb-0">{name() || "Unknown"}</h6>}
              >
                <input type="text" class="form-control form-control-sm" value={name()}
                  onInput={e => handleInput(e.target.value)}></input>
              </Show>
              <small class="text-muted">{_props.host.Iface}</small>
            </div>
            {now}
          </div>
          <div class="small">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">IP</span>
              <a href={"http://" + _props.host.IP} target="_blank">{_props.host.IP}</a>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">MAC</span>
              <span class="font-monospace small">{_props.host.Mac}</span>
            </div>
            <Show when={_props.host.Hw}>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">HW</span>
                <span title={_props.host.Hw}>{_props.host.Hw.slice(0, 20)}</span>
              </div>
            </Show>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Known</span>
              <div class="form-check form-switch form-check-sm d-inline-block">
                <input class="form-check-input" type="checkbox" checked={_props.host.Known === 1}
                  onClick={handleToggle}></input>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
          <small class="text-muted">{_props.host.Date}</small>
          <Show
            when={editNames()}
            fallback={
              <a href={"/host/" + _props.host.ID} class="btn btn-sm btn-outline-primary">
                <i class="bi bi-three-dots"></i>
              </a>
            }
          >
            <input
              type="checkbox"
              class="form-check-input"
              checked={selectedIDs().includes(_props.host.ID)}
              onChange={e => handleCheck((e.target as HTMLInputElement).checked)}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default DeviceCard