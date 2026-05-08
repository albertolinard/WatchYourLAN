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

// Add - write data to InfluxDB2
func Add(appConfig models.Conf, oneHist models.Host) {
	w := getWriter(appConfig)

	name := escapeTag(oneHist.Name)
	if name == "" {
		name = "unknown"
	}

	line := fmt.Sprintf("WatchYourLAN,IP=%s,iface=%s,name=%s,mac=%s,known=%d state=%d",
		escapeTag(oneHist.IP), escapeTag(oneHist.Iface), name, escapeTag(oneHist.Mac),
		oneHist.Known, oneHist.Now)

	err := w.WriteRecord(context.Background(), line)
	if check.IfError(err) {
		slog.Error("InfluxDB write failed", "err", err)
	}
}
