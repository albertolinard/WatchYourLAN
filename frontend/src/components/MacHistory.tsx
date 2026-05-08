import { For, onCleanup, onMount, Show } from "solid-js";
import { getHistoryForMac } from "../functions/history";
import { Host, show } from "../functions/exports";
import { createStore } from "solid-js/store";

function MacHistory(_props: any) {

  const [hist, setHist] = createStore<Host[]>([]);
  let interval: number;

  onMount(async () => {
    const newHistory = await getHistoryForMac(_props.mac, _props.date);
    setHist(newHistory);
    interval = setInterval(async () => {
      const newHistory = await getHistoryForMac(_props.mac, _props.date);
      setHist(newHistory);
    }, 60000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="uptime-strip">
      <For each={hist}>{(h, index) =>
        <Show when={index() < show()}>
          <span
            class={`uptime-block ${h.Now === 0 ? "uptime-off" : "uptime-on"}`}
            title={`Date: ${h.Date}\nIface: ${h.Iface}\nIP: ${h.IP}\nKnown: ${h.Known ? "Yes" : "No"}`}
          ></span>
        </Show>
      }</For>
    </div>
  )
}

export default MacHistory