import { For, onCleanup, onMount, Show } from "solid-js";
import { getHistoryForMac } from "../functions/history";
import { HostEvent, show } from "../functions/exports";
import { createStore } from "solid-js/store";

function MacHistory(_props: any) {

  const [hist, setHist] = createStore<HostEvent[]>([]);
  let interval: number;

  const load = async () => {
    const fresh = await getHistoryForMac(_props.mac, _props.date);
    setHist(fresh);
  };

  onMount(async () => {
    await load();
    interval = setInterval(load, 60000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  const colorClass = (kind: HostEvent["kind"]) => {
    switch (kind) {
      case "online":  return "uptime-on";
      case "offline": return "uptime-off";
      default:        return "uptime-other";
    }
  };

  return (
    <div class="uptime-strip">
      <For each={hist}>{(e, index) =>
        <Show when={index() < show()}>
          <span
            class={`uptime-block ${colorClass(e.kind)}`}
            title={`Time: ${e.ts}\nKind: ${e.kind}${e.old_value ? `\nOld: ${e.old_value}` : ""}${e.new_value ? `\nNew: ${e.new_value}` : ""}`}
          ></span>
        </Show>
      }</For>
    </div>
  )
}

export default MacHistory
