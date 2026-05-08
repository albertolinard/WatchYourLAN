import { createSignal, For } from "solid-js";
import { apiPortScan } from "../../functions/api";

function Ping(_props: any) {

  let stop = false;

  const [beginStr, setBegin] = createSignal("");
  const [endStr, setEnd] = createSignal("");
  const [curPort, setCurPort] = createSignal("");
  const [foundPorts, setFoundPorts] = createSignal<number[]>([]);

  const handleScan = async () => {
    stop = false;

    let begin = Number(beginStr());
    if (Number.isNaN(begin) || begin < 1 || begin > 65535) {
      begin = 1;
    }
    let end = Number(endStr());
    if (Number.isNaN(end) || end < 1 || end > 65535) {
      end = 65535;
    }

    let portOpened:boolean;
    for (let i = begin ; i <= end; i++) {

      if (stop) {
          break;
      }
      setCurPort(i.toString());
      portOpened = await apiPortScan(_props.IP, i);
      if (portOpened) {
        setFoundPorts([...foundPorts(), i]);
      }
    }
  };

  const handleStop = () => {
    if (stop) {
      setBegin(curPort());
      handleScan();
    } else {
      stop = true;
    }
  }

  return (
    <div class="card border-primary h-100">
      <div class="card-header d-flex align-items-center">
        <i class="bi bi-radar me-2"></i>
        <h6 class="mb-0">Port Scan</h6>
      </div>
      <div class="card-body">
        <div class="input-group input-group-sm mb-2">
          <input type="text" class="form-control" placeholder="1"
            onInput={e => setBegin(e.target.value)}></input>
          <input type="text" class="form-control" placeholder="65535"
            onInput={e => setEnd(e.target.value)}></input>
          <button type="button" onClick={handleScan} class="btn btn-sm btn-primary">
            <i class="bi bi-play-fill me-1"></i>Scan
          </button>
        </div>
        {curPort() != ""
        ? <div class="d-flex justify-content-between align-items-center mb-2">
            <button type="button" onClick={handleStop} class="btn btn-sm btn-warning">
              <i class="bi bi-pause-fill me-1"></i>{stop ? "Continue" : "Stop"}
            </button>
            <small class="text-muted">Scanning: {curPort()}</small>
          </div>
        : <></>
        }
        <For each={foundPorts()}>{(port) =>
          <a class="badge bg-success me-1 mb-1 text-decoration-none" href={"http://" + _props.IP + ":" + port} target="_blank">{port}</a>
        }</For>
      </div>
    </div>
  )
}

export default Ping