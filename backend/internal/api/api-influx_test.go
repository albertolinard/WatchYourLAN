package api

import (
	"strings"
	"testing"
)

func TestBuildUptimeFluxQueryGroupsByMACBeforeCounting(t *testing.T) {
	query := buildUptimeFluxQuery("watchyourlan", 24, "5m")

	required := []string{
		`|> group(columns: ["mac"])`,
		`|> aggregateWindow(every: 5m, fn: last, createEmpty: true)`,
		`|> fill(usePrevious: true)`,
		`|> group(columns: ["_time"])`,
		`|> count(column: "_value")`,
		`|> sort(columns: ["_time"])`,
	}

	for _, want := range required {
		if !strings.Contains(query, want) {
			t.Fatalf("query missing %q\n%s", want, query)
		}
	}
}
