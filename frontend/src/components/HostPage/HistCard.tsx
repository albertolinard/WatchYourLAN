import { createSignal, onMount } from "solid-js";
import { setShow } from "../../functions/exports";
import MacHistory from "../MacHistory"

function HistCard(_props: any) {

  const [today, setToday] = createSignal('');

  onMount(() => {
    setShow(15000);
    setToday(new Date().toLocaleDateString("en-CA"));
  });

  const handleDate = (date: string) => {
    setToday("");
    setToday(date);
  };

  return (
    <div class="card border-primary">
      <div class="card-header d-flex align-items-center justify-content-between">
        <div class="input-group" style="width: fit-content;">
          <span class="input-group-text"><i class="bi bi-clock-history me-1"></i>History</span>
          <input
            type="date"
            class="form-control form-control-sm"
            value={today()}
            onInput={(e) => handleDate(e.currentTarget.value)}
          />
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="d-flex align-items-center gap-1">
            <span class="uptime-block uptime-on"></span>
            <small class="text-muted">Online</small>
          </span>
          <span class="d-flex align-items-center gap-1">
            <span class="uptime-block uptime-off"></span>
            <small class="text-muted">Offline</small>
          </span>
        </div>
      </div>
      <div class="card-body">
        <div class="uptime-strip-container">
          {_props.mac !== "" && today() !== ""
          ? <MacHistory mac={_props.mac} date={today()}></MacHistory>
          : <div class="text-center text-muted py-3">Loading...</div>
          }
        </div>
      </div>
    </div>
  )
}

export default HistCard