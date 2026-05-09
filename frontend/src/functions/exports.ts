import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export interface Host {
	id:         string;
	mac:        string;
	name:       string;
	dns:        string;
	iface:      string;
	ip:         string;
	vendor:     string;
	known:      boolean;
	online:     boolean;
	first_seen: string;
	last_seen:  string;
};

export type EventKind =
	| "online"
	| "offline"
	| "ip_change"
	| "renamed"
	| "known_toggled";

export interface HostEvent {
	id:        string;
	host_id:   string;
	mac:       string;
	ts:        string;
	kind:      EventKind;
	old_value?: string;
	new_value?: string;
};

export interface Conf {
	Host:	   string;
	Port:	   string;
	Theme:	   string;
	Color:     string;
	DirPath:   string;
	Timeout:   number;
	NodePath:  string;
	LogLevel:  string;
	Ifaces:	   string;
	ArpArgs:   string;
	ArpStrs:   string[];
	TrimHist:  number;
	ShoutURL:  string;
	PGConnect: string;
	// InfluxDB
	InfluxEnable:  boolean;
	InfluxAddr:    string;
	InfluxToken:   string;
	InfluxOrg:     string;
	InfluxBucket:  string;
	InfluxSkipTLS: boolean;
	// Prometheus
	PrometheusEnable: boolean;
};

export const emptyHost: Host = {
	id:         "",
	mac:        "",
	name:       "",
	dns:        "",
	iface:      "",
	ip:         "",
	vendor:     "",
	known:      false,
	online:     false,
	first_seen: "",
	last_seen:  "",
};

export const emptyConf:Conf = {
	Host:	 "",
	Port:	 "",
	Theme:	 "",
	Color:   "",
	DirPath: "",
	Timeout: 120,
	NodePath: "",
	LogLevel: "",
	Ifaces:	 "",
	ArpArgs: "",
	ArpStrs: [],
	TrimHist: 48,
	ShoutURL: "",
	PGConnect: "",
	InfluxEnable:  false,
	InfluxAddr:    "",
	InfluxToken:   "",
	InfluxOrg:     "",
	InfluxBucket:  "",
	InfluxSkipTLS: false,
	PrometheusEnable: false,
};

export const [allHosts, setAllHosts] = createStore<Host[]>([]);
export const [bkpHosts, setBkpHosts] = createSignal<Host[]>([]);

export const [ifaces, setIfaces] = createSignal<string[]>([]);

export const [appConfig, setAppConfig] = createSignal<Conf>(emptyConf);

export const [editNames, setEditNames] = createSignal(false);

export const [show, setShow] = createSignal<number>(200);

export const [histUpdOnFilter, setHistUpdOnFilter] = createSignal(false);

export const [selectedIDs, setSelectedIDs] = createSignal<string[]>([]);

export interface Stat {
  total:   number;
  online:  number;
  offline: number;
  known:   number;
  unknown: number;
};

export interface ScanState {
  running: boolean;
};

export const emptyStat:Stat = {
  total:   0,
  online:  0,
  offline: 0,
  known:   0,
  unknown: 0,
};

export const [appStat, setAppStat] = createSignal<Stat>(emptyStat);

export const [scanState, setScanState] = createSignal<ScanState>({ running: false });

export const [viewMode, setViewMode] = createSignal<string>("table");

export const [activeFilters, setActiveFilters] = createSignal<{field: string, label: string}[]>([]);
