package influx

import (
	"context"
	"crypto/tls"
	"fmt"
	"log/slog"
	"strings"
	"sync"

	"github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

var (
	clientMu     sync.Mutex
	client       influxdb2.Client
	writeAPI     api.WriteAPIBlocking
	currentAddr  string
	currentToken string
	currentOrg   string
	currentBkt   string
	currentSkip  bool
)

func getWriter(appConfig models.Conf) api.WriteAPIBlocking {
	clientMu.Lock()
	defer clientMu.Unlock()

	if client != nil &&
		currentAddr == appConfig.InfluxAddr &&
		currentToken == appConfig.InfluxToken &&
		currentOrg == appConfig.InfluxOrg &&
		currentBkt == appConfig.InfluxBucket &&
		currentSkip == appConfig.InfluxSkipTLS {
		return writeAPI
	}

	if client != nil {
		client.Close()
	}

	client = influxdb2.NewClientWithOptions(appConfig.InfluxAddr, appConfig.InfluxToken,
		influxdb2.DefaultOptions().
			SetUseGZip(true).
			SetTLSConfig(&tls.Config{
				InsecureSkipVerify: appConfig.InfluxSkipTLS,
			}))
	writeAPI = client.WriteAPIBlocking(appConfig.InfluxOrg, appConfig.InfluxBucket)

	currentAddr = appConfig.InfluxAddr
	currentToken = appConfig.InfluxToken
	currentOrg = appConfig.InfluxOrg
	currentBkt = appConfig.InfluxBucket
	currentSkip = appConfig.InfluxSkipTLS

	return writeAPI
}

func escapeTag(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, " ", "\\ ")
	s = strings.ReplaceAll(s, ",", "\\,")
	s = strings.ReplaceAll(s, "=", "\\=")
	s = strings.ReplaceAll(s, "\n", "")
	s = strings.ReplaceAll(s, "\r", "")
	return s
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

// Add - write data to InfluxDB2.
// Booleans are encoded as 0/1 ints to match the historical line-protocol shape.
func Add(appConfig models.Conf, h models.Host) {
	w := getWriter(appConfig)

	name := escapeTag(h.Name)
	if name == "" {
		name = "unknown"
	}

	line := fmt.Sprintf("WatchYourLAN,IP=%s,iface=%s,name=%s,mac=%s,known=%d state=%d",
		escapeTag(h.IP), escapeTag(h.Iface), name, escapeTag(h.Mac),
		boolToInt(h.Known), boolToInt(h.Online))

	err := w.WriteRecord(context.Background(), line)
	if check.IfError(err) {
		slog.Error("InfluxDB write failed", "err", err)
	}
}
