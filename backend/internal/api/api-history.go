package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/WatchYourLAN/internal/gdb"
)

// getEvents godoc
// @Summary      Get full event log
// @Description  Retrieve the complete host_events log. Not recommended; output can be large.
// @Tags         events
// @Produce      json
// @Success      200  {array}   models.HostEvent
// @Router       /events [get]
func getEvents(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, gdb.AllEvents())
}

// getEventsByMAC godoc
// @Summary      Get events by MAC
// @Description  Retrieve the latest events for a specific host by MAC address.
// @Tags         events
// @Produce      json
// @Param        mac   path      string  true  "MAC address"
// @Param        num   query     int     false "Number of entries to return (default 200)"
// @Success      200   {array}   models.HostEvent
// @Router       /events/{mac} [get]
func getEventsByMAC(c *gin.Context) {
	mac := c.Param("mac")
	num, _ := strconv.Atoi(c.DefaultQuery("num", "200"))
	c.IndentedJSON(http.StatusOK, gdb.EventsByMAC(mac, num))
}

// getEventsByDate godoc
// @Summary      Get events by date prefix
// @Description  Retrieve events for a specific host within a date prefix.
// @Description  Accepts: `2025`, `2025-09`, `2025-09-06`, or `2025-09-06 00:58:26`.
// @Tags         events
// @Produce      json
// @Param        mac   path      string  true  "MAC address"
// @Param        date  path      string  true  "Date filter (YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DD HH:mm:ss)"
// @Success      200   {array}   models.HostEvent
// @Router       /events/{mac}/{date} [get]
func getEventsByDate(c *gin.Context) {
	mac := c.Param("mac")
	date := c.Param("date")

	start, end, ok := parseDatePrefix(date)
	if !ok {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	c.IndentedJSON(http.StatusOK, gdb.EventsByMACAndRange(mac, start, end))
}

// parseDatePrefix turns a flexible prefix into a [start, end) UTC range.
func parseDatePrefix(s string) (start, end time.Time, ok bool) {
	layouts := []struct {
		fmt  string
		step func(time.Time) time.Time
	}{
		{"2006-01-02 15:04:05", func(t time.Time) time.Time { return t.Add(time.Second) }},
		{"2006-01-02", func(t time.Time) time.Time { return t.AddDate(0, 0, 1) }},
		{"2006-01", func(t time.Time) time.Time { return t.AddDate(0, 1, 0) }},
		{"2006", func(t time.Time) time.Time { return t.AddDate(1, 0, 0) }},
	}
	for _, l := range layouts {
		t, err := time.ParseInLocation(l.fmt, s, time.UTC)
		if err == nil {
			return t, l.step(t), true
		}
	}
	return time.Time{}, time.Time{}, false
}
