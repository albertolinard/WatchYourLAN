import { useParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

import { apiGetHost } from "../functions/api";

import HostCard from "../components/HostPage/HostCard";
import Ping from "../components/HostPage/Ping";
import HistCard from "../components/HostPage/HistCard";
import { emptyHost, Host } from "../functions/exports";

function HostPage() {

  const [currentHost, setCurrentHost] = createSignal<Host>(emptyHost);

  onMount(async () => {
    const params = useParams();
    const host = await apiGetHost(params.id);

    setCurrentHost(host);
  });

  return (
    <>
    <div class="row g-3">
      <div class="col-lg-8">
        <HostCard host={currentHost()}></HostCard>
      </div>
      <div class="col-lg-4">
        <Ping IP={currentHost().ip}></Ping>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-12">
        <HistCard mac={currentHost().mac}></HistCard>
      </div>
    </div>
    </>
  )
}

export default HostPage
