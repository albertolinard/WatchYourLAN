package arp

import (
	"log/slog"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

var arpArgs string

// extractIface finds the interface name from an arp-scan argument string.
// It looks for -I or --interface flags, and falls back to the last word.
func extractIface(args string) string {
	parts := strings.Split(args, " ")
	for i, part := range parts {
		if (part == "-I" || part == "--interface") && i+1 < len(parts) {
			return parts[i+1]
		}
		if strings.HasPrefix(part, "-I=") {
			return strings.TrimPrefix(part, "-I=")
		}
		if strings.HasPrefix(part, "--interface=") {
			return strings.TrimPrefix(part, "--interface=")
		}
	}
	return parts[len(parts)-1]
}

func scanIface(iface string) string {
	var cmd *exec.Cmd

	if arpArgs != "" {
		cmd = exec.Command("arp-scan", "-glNx", arpArgs, "-I", iface)
	} else {
		cmd = exec.Command("arp-scan", "-glNx", "-I", iface)
	}
	out, err := cmd.Output()
	slog.Debug(cmd.String())

	if check.IfError(err) {
		return string("")
	}
	return string(out)
}

func scanStr(str string) string {

	args := strings.Split(str, " ")
	cmd := exec.Command("arp-scan", args...)

	out, err := cmd.Output()
	slog.Debug(cmd.String())

	if check.IfError(err) {
		return string("")
	}
	return string(out)
}

func parseOutput(text, iface string) []models.Host {
	var foundHosts = []models.Host{}

	lines := strings.Split(text, "\n")

	for _, host := range lines {
		if host == "" {
			continue
		}
		fields := strings.Split(host, "\t")
		if len(fields) < 3 {
			continue
		}
		var oneHost models.Host
		oneHost.Iface = iface
		oneHost.IP = fields[0]
		oneHost.Mac = fields[1]
		oneHost.Hw = fields[2]
		oneHost.Date = time.Now().Format("2006-01-02 15:04:05")
		oneHost.Now = 1
		foundHosts = append(foundHosts, oneHost)
	}

	return foundHosts
}

// Scan all interfaces in parallel
func Scan(ifaces, args string, strs []string) []models.Host {
	arpArgs = args

	var jobs []func() []models.Host

	if ifaces != "" {
		for _, iface := range strings.Split(ifaces, " ") {
			i := iface
			jobs = append(jobs, func() []models.Host {
				slog.Debug("Scanning interface " + i)
				text := scanIface(i)
				slog.Debug("Found IPs on " + i + ":\n" + text)
				return parseOutput(text, i)
			})
		}
	}

	for _, s := range strs {
		str := s
		jobs = append(jobs, func() []models.Host {
			slog.Debug("Scanning string " + str)
			text := scanStr(str)
			slog.Debug("Found IPs:\n" + text)
			return parseOutput(text, extractIface(str))
		})
	}

	resCh := make(chan []models.Host, len(jobs))
	var wg sync.WaitGroup
	for _, job := range jobs {
		wg.Add(1)
		go func(j func() []models.Host) {
			defer wg.Done()
			resCh <- j()
		}(job)
	}
	wg.Wait()
	close(resCh)

	var foundHosts []models.Host
	for hosts := range resCh {
		foundHosts = append(foundHosts, hosts...)
	}
	return foundHosts
}