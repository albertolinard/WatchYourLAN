import { createSignal, For, Show } from "solid-js";
import { Host, ifaces, activeFilters, setActiveFilters, viewMode, setViewMode } from "../functions/exports";
import { filterFunc } from "../functions/filter";
import { searchFunc } from "../functions/search";
import AddHostModal from "./AddHostModal";

function SearchFilterBar() {
  const [searchText, setSearchText] = createSignal("");
  const [showAdd, setShowAdd] = createSignal(false);

  const addFilter = (field: keyof Host, value: any, label: string) => {
    filterFunc(field, value);
    setActiveFilters(prev => [...prev, { field, label }]);
  };

  const removeFilter = (idx: number) => {
    setActiveFilters(prev => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
    // Reset all filters and re-apply remaining
    filterFunc("ID", 0);
    for (const f of activeFilters().filter((_, i) => i !== idx)) {
      filterFunc(f.field as keyof Host, undefined);
    }
  };

  const clearAll = () => {
    setActiveFilters([]);
    setSearchText("");
    filterFunc("ID", 0);
    searchFunc("");
  };

  return (
    <div class="sticky-top py-2" style="background: var(--bs-body-bg); z-index: 100;">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        {/* Search */}
        <div class="input-group" style="max-width: 18em;">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            class="form-control"
            placeholder="Search hosts..."
            value={searchText()}
            onInput={e => {
              setSearchText(e.target.value);
              searchFunc(e.target.value);
            }}
          />
        </div>

        {/* Filter dropdowns */}
        <div class="dropdown">
          <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-funnel"></i> Filter
          </button>
          <ul class="dropdown-menu">
            <li class="dropdown-header">Interface</li>
            <For each={ifaces()}>{(iface) =>
              <li><a class="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addFilter("Iface", iface, "Iface: " + iface); }}>{iface}</a></li>
            }</For>
            <li><hr class="dropdown-divider" /></li>
            <li class="dropdown-header">Status</li>
            <li><a class="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addFilter("Now", 1, "Online"); }}>Online</a></li>
            <li><a class="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addFilter("Now", 0, "Offline"); }}>Offline</a></li>
            <li><hr class="dropdown-divider" /></li>
            <li class="dropdown-header">Known</li>
            <li><a class="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addFilter("Known", 1, "Known"); }}>Known</a></li>
            <li><a class="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); addFilter("Known", 0, "Unknown"); }}>Unknown</a></li>
          </ul>
        </div>

        {/* Active filter pills */}
        <For each={activeFilters()}>{(filter, idx) =>
          <span class="badge bg-primary d-flex align-items-center gap-1">
            {filter.label}
            <i class="bi bi-x-circle cursor-pointer" style="cursor:pointer;" onClick={() => removeFilter(idx())}></i>
          </span>
        }</For>

        <Show when={activeFilters().length > 0 || searchText() !== ""}>
          <button class="btn btn-sm btn-outline-secondary" onClick={clearAll}>
            <i class="bi bi-x-lg"></i> Clear
          </button>
        </Show>

        {/* Add Host */}
        <button
          class="btn btn-success ms-auto"
          title="Add host manually"
          onClick={() => setShowAdd(true)}
        >
          <i class="bi bi-plus-lg"></i> Add Host
        </button>

        {/* View toggle */}
        <div class="btn-group">
          <button class={`btn btn-sm ${viewMode() === "table" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("table")} title="Table view">
            <i class="bi bi-list"></i>
          </button>
          <button class={`btn btn-sm ${viewMode() === "cards" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("cards")} title="Card view">
            <i class="bi bi-grid-3x3-gap"></i>
          </button>
          <button class={`btn btn-sm ${viewMode() === "topology" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("topology")} title="Topology view">
            <i class="bi bi-diagram-3"></i>
          </button>
        </div>
      </div>
      <AddHostModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

export default SearchFilterBar