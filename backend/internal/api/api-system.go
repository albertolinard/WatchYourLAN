package api

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/gdb"
	"github.com/aceberg/WatchYourLAN/internal/models"
	"github.com/aceberg/WatchYourLAN/internal/notify"
	"github.com/aceberg/WatchYourLAN/internal/routines"
)

// getVersion godoc
// @Summary      Get application version
// @Tags         system
// @Produce      json
// @Success      200  {string}  string
// @Router       /version [get]
func getVersion(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, conf.AppConfig.Version)
}

// triggerRescan godoc
// @Summary      Rescan all interfaces now
// @Tags         system
// @Produce      json
// @Success      200  {string}  string  "OK"
// @Router       /rescan [get]
func triggerRescan(c *gin.Context) {
	routines.ScanRestart()
	c.Status(http.StatusOK)
}

// getScanState godoc
// @Summary      Get scan state
// @Tags         system
// @Produce      json
// @Success      200  {object}  routines.ScanState
// @Router       /scan_state [get]
func getScanState(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, routines.GetScanState())
}

// getConfig godoc
// @Summary      Get application configuration
// @Tags         system
// @Produce      json
// @Success      200  {object}  models.Conf
// @Router       /config [get]
func getConfig(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, conf.AppConfig)
}

// notifyTest godoc
// @Summary      Send test notification
// @Tags         system
// @Produce      json
// @Success      200  {string}  string  "OK"
// @Router       /notify_test [get]
func notifyTest(c *gin.Context) {
	notify.Test()
	c.Status(http.StatusOK)
}

// getStatus godoc
// @Summary      Get network status
// @Tags         system
// @Produce      json
// @Param        iface  path      string  false  "Interface name (omit for all)"
// @Success      200    {object}  models.Stat
// @Router       /status/{iface} [get]
func getStatus(c *gin.Context) {
	allHosts := gdb.ListHosts()

	iface := c.Param("iface")
	if len(iface) > 0 && iface[0] == '/' {
		iface = iface[1:]
	}

	var search []models.Host
	if iface != "" && iface != "undefined" {
		search = gdb.ListHostsByIface(iface)
	} else {
		search = allHosts
	}

	var stat models.Stat
	for _, h := range search {
		stat.Total++
		if h.Known {
			stat.Known++
		} else {
			stat.Unknown++
		}
		if h.Online {
			stat.Online++
		} else {
			stat.Offline++
		}
	}

	c.IndentedJSON(http.StatusOK, stat)
}
