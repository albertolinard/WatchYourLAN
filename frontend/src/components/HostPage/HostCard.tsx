import { Show } from "solid-js";
import { apiDelHost, apiEditHost, apiWOL } from "../../functions/api";
import { vendorIcon, vendorName } from "../../functions/vendor";
import { debounce } from "@solid-primitives/scheduled";

function HostCard(_props: any) {

  let name:string = "";

  const debouncedApi = debounce(async (val: string) => {
      await apiEditHost(_props.host.ID, val, "");
    }, 300);

  const handleInput = async (n: string) => {
    name = n;
    debouncedApi(n);
  };

  const handleToggle = async () => {
    if (name == "") {
      name = _props.host.Name;
    }
    await apiEditHost(_props.host.ID, name, 'toggle');
  };

  const handleDel = async () => {
    await apiDelHost(_props.host.ID);
    window.location.href = '/';
  };

  const handleWOL = async () => {
    await apiWOL(_props.host.Mac);
  };

  const icon = vendorIcon(_props.host.Hw, _props.host.Mac);
  const vendor = vendorName(_props.host.Mac);
  const isOnline = _props.host.Now == 1;
  const isKnown = _props.host.Known == 1;

  return (
    <div class="card border-primary h-100">
      <div class="card-header d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class={`bi ${icon} fs-3 text-primary`}></i>
          <div>
            <h5 class="mb-0">{_props.host.Name || "Unknown"}</h5>
            <small class="text-muted">{vendor ? vendor : _props.host.Hw}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          {isOnline
            ? <span class="badge bg-success online-pulse">Online</span>
            : <span class="badge bg-secondary">Offline</span>
          }
        </div>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-sm-6">
            <div class="card bg-body-secondary h-100">
              <div class="card-body p-3">
                <h6 class="text-muted small mb-2"><i class="bi bi-globe me-1"></i>Network</h6>
                <dl class="row mb-0">
                  <dt class="col-sm-4 text-muted small">IP</dt>
                  <dd class="col-sm-8"><a href={"http://" + _props.host.IP} target="_blank">{_props.host.IP}</a></dd>
                  <dt class="col-sm-4 text-muted small">DNS</dt>
                  <dd class="col-sm-8">{_props.host.DNS || "—"}</dd>
                  <dt class="col-sm-4 text-muted small">Iface</dt>
                  <dd class="col-sm-8">{_props.host.Iface}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card bg-body-secondary h-100">
              <div class="card-body p-3">
                <h6 class="text-muted small mb-2"><i class="bi bi-hdd-network me-1"></i>Hardware</h6>
                <dl class="row mb-0">
                  <dt class="col-sm-4 text-muted small">MAC</dt>
                  <dd class="col-sm-8"><code>{_props.host.Mac}</code></dd>
                  <dt class="col-sm-4 text-muted small">Type</dt>
                  <dd class="col-sm-8">{_props.host.Hw || "—"}</dd>
                  <dt class="col-sm-4 text-muted small">Last seen</dt>
                  <dd class="col-sm-8 small">{_props.host.Date}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 mt-1">
          <div class="col-12">
            <div class="d-flex align-items-center gap-3 flex-wrap">
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted small fw-semibold">Name:</span>
                <input type="text" class="form-control form-control-sm" style="max-width: 14em;"
                  value={_props.host.Name}
                  onInput={e => handleInput(e.target.value)}></input>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted small fw-semibold">Known:</span>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox"
                    checked={isKnown}
                    onClick={handleToggle}></input>
                </div>
              </div>
              <div class="ms-auto d-flex gap-2">
                <Show when={isOnline}>
                  <button type="button" onClick={handleWOL} class="btn btn-sm btn-outline-success" title="Wake-on-LAN">
                    <i class="bi bi-broadcast me-1"></i>WoL
                  </button>
                </Show>
                <button type="button" onClick={handleDel} class="btn btn-sm btn-outline-danger" title="Delete host">
                  <i class="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HostCard