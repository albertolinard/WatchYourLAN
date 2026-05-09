package prometheus

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// Handler - display Prometheus metrics
func Handler() func(c *gin.Context) {
	h := promhttp.Handler()
	return func(c *gin.Context) {
		if !conf.AppConfig.PrometheusEnable {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		h.ServeHTTP(c.Writer, c.Request)
	}
}

var up = promauto.NewGaugeVec(prometheus.GaugeOpts{
	Namespace: "watch_your_lan",
	Name:      "up",
	Help:      "Whether the host is up (1 for yes, 0 for no)",
}, []string{"ip", "iface", "name", "mac", "known"})

func boolToStr(b bool) string {
	if b {
		return "1"
	}
	return "0"
}

func boolToFloat(b bool) float64 {
	if b {
		return 1
	}
	return 0
}

// Add a Prometheus metric
func Add(h models.Host) {
	if h.Name == "" {
		h.Name = "unknown"
	}

	up.With(prometheus.Labels{
		"ip":    h.IP,
		"iface": h.Iface,
		"name":  h.Name,
		"mac":   h.Mac,
		"known": boolToStr(h.Known),
	}).Set(boolToFloat(h.Online))
}
