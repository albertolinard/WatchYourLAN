package routines

import (
	"log/slog"
	"time"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/gdb"
)

// HistoryTrim - drop host_events older than TrimHist hours.
func HistoryTrim() {
	go func() {
		for {
			time.Sleep(1 * time.Hour)

			hours := conf.AppConfig.TrimHist
			cutoff := time.Now().Add(-time.Duration(hours) * time.Hour)

			slog.Info("Trimming host events older than", "cutoff", cutoff)

			n := gdb.TrimEventsBefore(cutoff)
			slog.Info("Removed host events", "n", n)
		}
	}()
}
