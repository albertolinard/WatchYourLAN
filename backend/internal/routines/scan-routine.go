package routines

import (
	"time"

	"github.com/aceberg/WatchYourLAN/internal/arp"
	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/gdb"
	"github.com/aceberg/WatchYourLAN/internal/influx"
	"github.com/aceberg/WatchYourLAN/internal/models"
	"github.com/aceberg/WatchYourLAN/internal/notify"
	"github.com/aceberg/WatchYourLAN/internal/prometheus"
)

// influxWriteState — per-MAC online flag + cycles since last write.
// A point is written on transition or every N cycles as heartbeat.
var influxWriteState = struct {
	lastOnline map[string]bool
	seen       map[string]bool
	cycles     map[string]int
}{
	lastOnline: make(map[string]bool),
	seen:       make(map[string]bool),
	cycles:     make(map[string]int),
}

const influxHeartbeatCycles = 10

func writeInflux(h models.Host) {
	if !conf.AppConfig.InfluxEnable {
		return
	}
	prev := influxWriteState.lastOnline[h.Mac]
	wasSeen := influxWriteState.seen[h.Mac]
	cycles := influxWriteState.cycles[h.Mac]

	if wasSeen && prev == h.Online && cycles < influxHeartbeatCycles {
		influxWriteState.cycles[h.Mac] = cycles + 1
		return
	}

	// Fill empty tags that InfluxDB line protocol rejects.
	if h.Iface == "" {
		h.Iface = "unknown"
	}
	if h.IP == "" {
		h.IP = "0.0.0.0"
	}
	if h.Mac == "" {
		h.Mac = "00:00:00:00:00:00"
	}

	influx.Add(conf.AppConfig, h)
	influxWriteState.lastOnline[h.Mac] = h.Online
	influxWriteState.seen[h.Mac] = true
	influxWriteState.cycles[h.Mac] = 0
}

func startScan(quit chan bool) {
	var lastDate, nowDate, plusDate time.Time
	var foundHosts []models.Host

	for {
		select {
		case <-quit:
			return
		default:
			nowDate = time.Now()
			plusDate = lastDate.Add(time.Duration(conf.AppConfig.Timeout) * time.Second)

			if nowDate.After(plusDate) {
				setScanRunning(true)
				foundHosts = arp.Scan(conf.AppConfig.Ifaces, conf.AppConfig.ArpArgs, conf.AppConfig.ArpStrs)
				compareHosts(foundHosts)
				setScanRunning(false)
				lastDate = time.Now()
			}

			time.Sleep(time.Duration(1) * time.Minute)
		}
	}
}

func compareHosts(found []models.Host) {
	now := time.Now()
	for _, fh := range found {
		if _, ok := gdb.GetHostByMAC(fh.Mac); ok {
			continue
		}
		if fh.Name == "" || fh.DNS == "" {
			fh.Name, fh.DNS = check.DNS(fh)
		}
		notify.Unknown(fh)
	}

	if err := gdb.ApplyScan(found, now); err != nil {
		return
	}

	for _, host := range gdb.ListHosts() {
		writeInflux(host)
		if conf.AppConfig.PrometheusEnable {
			prometheus.Add(host)
		}
	}
}
