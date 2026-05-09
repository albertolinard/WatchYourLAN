package routines

import "sync/atomic"

var scanRunning atomic.Bool

// ScanState - lightweight API view of the current scan loop state.
type ScanState struct {
	Running bool `json:"running"`
}

func setScanRunning(running bool) {
	scanRunning.Store(running)
}

// GetScanState - current scan execution state.
func GetScanState() ScanState {
	return ScanState{Running: scanRunning.Load()}
}
