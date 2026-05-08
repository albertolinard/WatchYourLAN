import { Show } from "solid-js";
import { appConfig } from "../functions/exports";
import UptimeChart from "./UptimeChart";

function DashboardCharts() {
  return (
    <Show when={appConfig().InfluxEnable}>
      <div class="card border-primary mb-4">
        <div class="card-header d-flex align-items-center">
          <i class="bi bi-activity me-2"></i>
          <h6 class="mb-0">Network Uptime</h6>
        </div>
        <div class="card-body">
          <UptimeChart />
        </div>
      </div>
    </Show>
  );
}

export default DashboardCharts;