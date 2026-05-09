package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/gdb"
	"github.com/aceberg/WatchYourLAN/internal/routines"
)

func saveConfigHandler(c *gin.Context) {
	conf.AppConfig.Host = c.PostForm("host")
	conf.AppConfig.Port = c.PostForm("port")
	conf.AppConfig.Theme = c.PostForm("theme")
	conf.AppConfig.Color = c.PostForm("color")
	conf.AppConfig.NodePath = c.PostForm("node")
	conf.AppConfig.ShoutURL = c.PostForm("shout")

	conf.Write(conf.AppConfig)
	c.Redirect(http.StatusFound, c.Request.Referer())
}

func saveSettingsHandler(c *gin.Context) {
	conf.AppConfig.LogLevel = c.PostForm("log")
	conf.AppConfig.ArpArgs = c.PostForm("arpargs")
	conf.AppConfig.Ifaces = c.PostForm("ifaces")

	pgConnect := c.PostForm("pgconnect")
	if pgConnect != "" && pgConnect != conf.AppConfig.PGConnect {
		old := conf.AppConfig.PGConnect
		conf.AppConfig.PGConnect = pgConnect
		if err := gdb.Connect(); err != nil {
			conf.AppConfig.PGConnect = old
			c.AbortWithStatus(http.StatusBadGateway)
			return
		}
	}

	conf.AppConfig.Timeout, _ = strconv.Atoi(c.PostForm("timeout"))
	conf.AppConfig.TrimHist, _ = strconv.Atoi(c.PostForm("trim"))

	conf.AppConfig.ArpStrs = []string{}
	for _, s := range c.PostFormArray("arpstrs") {
		if s != "" {
			conf.AppConfig.ArpStrs = append(conf.AppConfig.ArpStrs, s)
		}
	}

	conf.Write(conf.AppConfig)
	routines.ScanRestart()
	c.Redirect(http.StatusFound, c.Request.Referer())
}

func saveInfluxHandler(c *gin.Context) {
	conf.AppConfig.InfluxAddr = c.PostForm("addr")
	conf.AppConfig.InfluxToken = c.PostForm("token")
	conf.AppConfig.InfluxOrg = c.PostForm("org")
	conf.AppConfig.InfluxBucket = c.PostForm("bucket")
	conf.AppConfig.InfluxEnable = c.PostForm("enable") == "on"
	conf.AppConfig.InfluxSkipTLS = c.PostForm("skip") == "on"

	conf.Write(conf.AppConfig)
	c.Redirect(http.StatusFound, c.Request.Referer())
}

func savePrometheusHandler(c *gin.Context) {
	conf.AppConfig.PrometheusEnable = c.PostForm("enable") == "on"
	conf.Write(conf.AppConfig)
	c.Redirect(http.StatusFound, c.Request.Referer())
}
