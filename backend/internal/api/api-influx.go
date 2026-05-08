package api

import (
	"crypto/tls"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// UptimePoint represents a single data point for the uptime chart
type UptimePoint struct {
	Time   string `json:"time"`
	Online int    `json:"online"`
}

// getInfluxUptime godoc
// @Summary      Get uptime chart data from InfluxDB
// @Description  Query InfluxDB for network-wide online device count over time
// @Tags         influx
// @Produce      json
// @Param        range  query  int  true  "Time range in hours (1-720)"
// @Success      200    {array}  UptimePoint
// @Router       /influx/uptime [get]
func getInfluxUptime(c *gin.Context) {
	cfg := conf.AppConfig

	if !cfg.InfluxEnable {
		c.JSON(http.StatusOK, []UptimePoint{})
		return
	}

	rangeStr := c.DefaultQuery("range", "24")
	rangeHours, err := strconv.Atoi(rangeStr)
	if err != nil || rangeHours < 1 {
		rangeHours = 24
	}
	if rangeHours > 720 {
		rangeHours = 720
	}

	// Determine aggregation window based on range
	aggWindow := "5m"
	if rangeHours > 168 {
		aggWindow = "1h"
	} else if rangeHours > 48 {
		aggWindow = "30m"
	}

	fluxQuery := fmt.Sprintf(`from(bucket: "%s")
  |> range(start: -%dh)
  |> filter(fn: (r) => r._measurement == "WatchYourLAN")
  |> filter(fn: (r) => r._field == "state")
  |> aggregateWindow(every: %s, fn: last, createEmpty: false)
  |> filter(fn: (r) => r._value == 1)
  |> group(columns: ["_time"])
  |> count()`, cfg.InfluxBucket, rangeHours, aggWindow)

	points, err := queryInfluxDB(cfg, fluxQuery)
	if err != nil {
		c.JSON(http.StatusOK, []UptimePoint{})
		return
	}

	c.JSON(http.StatusOK, points)
}

// queryInfluxDB executes a Flux query against InfluxDB and parses the CSV response
func queryInfluxDB(cfg models.Conf, fluxQuery string) ([]UptimePoint, error) {
	influxURL := strings.TrimRight(cfg.InfluxAddr, "/")
	queryURL := fmt.Sprintf("%s/api/v2/query?org=%s", influxURL, url.QueryEscape(cfg.InfluxOrg))

	reqBody := fmt.Sprintf(`{"query": %q, "type": "flux"}`, fluxQuery)

	req, err := http.NewRequest("POST", queryURL, strings.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Token "+cfg.InfluxToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/csv")

	client := &http.Client{Timeout: 30 * time.Second}
	if cfg.InfluxSkipTLS {
		client.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("influxdb returned status %d", resp.StatusCode)
	}

	return parseInfluxCSV(resp.Body)
}

// parseInfluxCSV parses the annotated CSV response from InfluxDB
func parseInfluxCSV(reader io.Reader) ([]UptimePoint, error) {
	var points []UptimePoint

	csvReader := csv.NewReader(reader)
	csvReader.FieldsPerRecord = -1 // Allow variable fields

	// Find the _time and _value column indices
	timeCol := -1
	valueCol := -1

	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		// Skip annotation rows starting with #
		if len(record) > 0 && strings.HasPrefix(record[0], "#") {
			// Parse column headers from #group annotation row
			if len(record) > 0 && record[0] == "#group" {
				// Next row after datatype will be the actual header
			}
			continue
		}

		// Find column indices from header row
		if timeCol == -1 {
			for i, col := range record {
				if col == "_time" {
					timeCol = i
				}
				if col == "_value" {
					valueCol = i
				}
			}
			continue
		}

		// Data rows
		if timeCol >= 0 && valueCol >= 0 && len(record) > timeCol && len(record) > valueCol {
			t, err := time.Parse(time.RFC3339, record[timeCol])
			if err != nil {
				continue
			}
			val, err := strconv.Atoi(record[valueCol])
			if err != nil {
				// Try float
				fval, ferr := strconv.ParseFloat(record[valueCol], 64)
				if ferr != nil {
					continue
				}
				val = int(fval)
			}
			points = append(points, UptimePoint{
				Time:   t.Format("2006-01-02T15:04:05Z07:00"),
				Online: val,
			})
		}
	}

	return points, nil
}