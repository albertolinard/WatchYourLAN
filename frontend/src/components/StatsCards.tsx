import { For } from "solid-js";
import { appStat } from "../functions/exports";

const cardDefs = [
  { key: "Total",   icon: "bi-diagram-3",     color: "primary",   label: "Total" },
  { key: "Online",  icon: "bi-check-circle",  color: "success",   label: "Online" },
  { key: "Offline", icon: "bi-x-circle",      color: "secondary", label: "Offline" },
  { key: "Known",   icon: "bi-shield-check",  color: "info",      label: "Known" },
  { key: "Unknown", icon: "bi-shield-exclamation", color: "warning", label: "Unknown" },
] as const;

function StatsCards() {
  const stat = () => appStat();

  return (
    <div class="row g-3 mb-4">
      <For each={cardDefs}>{(card) =>
        <div class="col">
          <div class={`card border-${card.color} h-100`}>
            <div class="card-body d-flex align-items-center py-3">
              <i class={`bi ${card.icon} fs-2 text-${card.color} me-3`}></i>
              <div>
                <div class="text-muted small">{card.label}</div>
                <div class="fs-4 fw-semibold">{stat()[card.key]}</div>
              </div>
            </div>
          </div>
        </div>
      }</For>
    </div>
  )
}

export default StatsCards