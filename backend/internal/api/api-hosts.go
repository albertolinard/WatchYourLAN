package api

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/gdb"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// getAllHosts godoc
// @Summary      Get all hosts
// @Description  Retrieve all hosts from the database
// @Tags         hosts
// @Produce      json
// @Success      200  {array}   models.Host
// @Router       /all [get]
func getAllHosts(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, gdb.ListHosts())
}

// getHost godoc
// @Summary      Get host by ID
// @Description  Retrieve detailed information about a host by its UUID
// @Tags         hosts
// @Produce      json
// @Param        id   path      string  true  "Host UUID"
// @Success      200  {object}  models.Host
// @Router       /host/{id} [get]
func getHost(c *gin.Context) {
	id := c.Param("id")
	host, ok := gdb.GetHost(id)
	if !ok {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	_, host.DNS = check.DNS(host)
	c.IndentedJSON(http.StatusOK, host)
}

// delHost godoc
// @Summary      Delete host
// @Description  Remove a host from the database by its UUID
// @Tags         hosts
// @Produce      json
// @Param        id   path      string  true  "Host UUID"
// @Success      200  {string}  string  "OK"
// @Router       /host/del/{id} [delete]
func delHost(c *gin.Context) {
	id := c.Param("id")
	host, ok := gdb.GetHost(id)
	if !ok {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}
	if err := gdb.DeleteHost(host.ID); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	slog.Info("Deleting from DB", "host", host)
	c.IndentedJSON(http.StatusOK, "OK")
}

// addHost godoc
// @Summary      Add host manually
// @Description  Add host by MAC, with optional name, ip, vendor.
// @Description  Returns the host with this MAC, either just added or pre-existing.
// @Tags         hosts
// @Produce      json
// @Param        mac     path      string  true   "Host MAC"
// @Param        name    query     string  false  "Name"
// @Param        ip      query     string  false  "IP"
// @Param        vendor  query     string  false  "Vendor"
// @Success      200     {object}  models.Host
// @Router       /host/add/{mac} [post]
func addHost(c *gin.Context) {
	mac := c.Param("mac")

	if existing, ok := gdb.GetHostByMAC(mac); ok {
		slog.Warn("Host with this MAC already exists", "host", existing)
		c.IndentedJSON(http.StatusOK, existing)
		return
	}

	now := time.Now()
	h := models.Host{
		Mac:       mac,
		Name:      c.Query("name"),
		IP:        c.Query("ip"),
		Vendor:    c.Query("vendor"),
		Online:    false,
		Known:     false,
		FirstSeen: now,
		LastSeen:  now,
	}
	if err := gdb.UpsertHost(&h); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	slog.Info("Added host to DB", "host", h)
	c.IndentedJSON(http.StatusOK, h)
}

// editHostBody — payload for PUT /host/:id.
// `toggle_known: true` flips the known flag; otherwise it is left as-is.
type editHostBody struct {
	Name         *string `json:"name"`
	ToggleKnown  bool    `json:"toggle_known"`
}

// editHost godoc
// @Summary      Edit host
// @Description  Update a host's name and optionally toggle its `known` flag.
// @Tags         hosts
// @Accept       json
// @Produce      json
// @Param        id    path      string         true  "Host UUID"
// @Param        body  body      editHostBody   true  "Edit payload"
// @Success      200    {object}  models.Host
// @Router       /host/{id} [put]
func editHost(c *gin.Context) {
	id := c.Param("id")
	host, ok := gdb.GetHost(id)
	if !ok {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	var body editHostBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	now := time.Now()

	if body.Name != nil && *body.Name != host.Name {
		old := host.Name
		host.Name = *body.Name
		_ = gdb.AddEvent(&models.HostEvent{
			HostID: host.ID, Mac: host.Mac, Ts: now,
			Kind: models.EventRenamed, OldValue: old, NewValue: host.Name,
		})
	}

	if body.ToggleKnown {
		host.Known = !host.Known
		newVal := "false"
		if host.Known {
			newVal = "true"
		}
		_ = gdb.AddEvent(&models.HostEvent{
			HostID: host.ID, Mac: host.Mac, Ts: now,
			Kind: models.EventKnownToggled, NewValue: newVal,
		})
	}

	if err := gdb.SaveHost(&host); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, host)
}
