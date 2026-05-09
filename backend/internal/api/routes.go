package api

import (
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Routes - register API routes.
func Routes(router *gin.Engine) {
	r0 := router.Group("/api")
	{
		r0.GET("/all", getAllHosts)        // api-hosts.go
		r0.GET("/host/:id", getHost)       // api-hosts.go
		r0.PUT("/host/:id", editHost)      // api-hosts.go
		r0.DELETE("/host/:id", delHost)    // api-hosts.go
		r0.POST("/host/add/:mac", addHost) // api-hosts.go

		r0.GET("/config", getConfig)        // api-system.go
		r0.GET("/notify_test", notifyTest)  // api-system.go
		r0.GET("/status/*iface", getStatus) // api-system.go
		r0.GET("/version", getVersion)      // api-system.go
		r0.GET("/rescan", triggerRescan)    // api-system.go
		r0.GET("/scan_state", getScanState) // api-system.go

		r0.GET("/events", getEvents)                  // api-history.go
		r0.GET("/events/:mac", getEventsByMAC)        // api-history.go
		r0.GET("/events/:mac/:date", getEventsByDate) // api-history.go

		r0.GET("/port/:addr/:port", getPortState) // api-network.go
		r0.GET("/wol/:mac", sendWOL)              // api-network.go

		r0.GET("/influx/uptime", getInfluxUptime) // api-influx.go

		r0.POST("/config/", saveConfigHandler)                // config.go
		r0.POST("/config_settings/", saveSettingsHandler)     // config.go
		r0.POST("/config_influx/", saveInfluxHandler)         // config.go
		r0.POST("/config_prometheus/", savePrometheusHandler) // config.go
	}

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
