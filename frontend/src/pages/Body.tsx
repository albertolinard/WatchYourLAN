import { For, onMount, Show } from "solid-js";

import { allHosts, viewMode } from "../functions/exports";

import TableRow from "../components/Body/TableRow";
import DeviceCard from "../components/Body/DeviceCard";
import TableHead from "../components/Body/TableHead";
import CardHead from "../components/Body/CardHead";
import StatsCards from "../components/StatsCards";
import SearchFilterBar from "../components/SearchFilterBar";
import { getHosts } from "../functions/atstart";

function Body() {

  onMount(() => {
    getHosts();
  });

  return (
    <>
    <StatsCards />
    <SearchFilterBar />
    <div class="card border-primary">
      <div class="card-header">
        <CardHead></CardHead>
      </div>
      <div class="card-body table-responsive">
        <Show when={viewMode() === "table"}>
          <table class="table table-striped table-hover">
            <TableHead></TableHead>
            <tbody>
              <For each={allHosts}>{(host, index) =>
              <TableRow host={host} index={index() + 1}></TableRow>
              }</For>
            </tbody>
          </table>
        </Show>
        <Show when={viewMode() === "cards"}>
          <div class="row g-3">
            <For each={allHosts}>{(host) =>
            <div class="col-xl-3 col-lg-4 col-md-6">
              <DeviceCard host={host}></DeviceCard>
            </div>
            }</For>
          </div>
        </Show>
      </div>
    </div>
    </>
  )
}

export default Body