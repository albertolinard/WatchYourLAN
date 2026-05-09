import { For } from "solid-js";
import { allHosts } from "../functions/exports";
import { vendorIcon } from "../functions/vendor";

interface IfaceGroup {
  iface: string;
  hosts: typeof allHosts[0][];
}

function TopologyMap() {

  const groups = (): IfaceGroup[] => {
    const map = new Map<string, typeof allHosts[0][]>();
    for (const h of allHosts) {
      const key = h.iface || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(h);
    }
    return Array.from(map.entries()).map(([iface, hosts]) => ({ iface, hosts }));
  };

  const onlineCount = (hosts: typeof allHosts[0][]) =>
    hosts.filter(h => h.online).length;

  return (
    <div class="card border-primary mb-4">
      <div class="card-header d-flex align-items-center">
        <i class="bi bi-diagram-3 me-2"></i>
        <h6 class="mb-0">Network Topology</h6>
      </div>
      <div class="card-body">
        <For each={groups()}>{(group) =>
          <div class="mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-primary">{group.iface}</span>
              <small class="text-muted">
                {group.hosts.length} device{group.hosts.length !== 1 ? "s" : ""} · {onlineCount(group.hosts)} online
              </small>
            </div>
            <div class="topology-nodes">
              <For each={group.hosts}>{(host) =>
                <a href={`/host/${host.id}`} class="topology-node" classList={{
                  "topology-node-online":  host.online,
                  "topology-node-offline": !host.online,
                  "topology-node-known":   host.known,
                }}>
                  <i class={`bi ${vendorIcon(host.vendor, host.mac)}`}></i>
                  <span class="topology-node-name">{host.name || host.ip}</span>
                </a>
              }</For>
            </div>
          </div>
        }</For>
      </div>
    </div>
  )
}

export default TopologyMap
