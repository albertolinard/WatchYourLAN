package portscan

import (
	"log/slog"
	"net"
	"time"
)

// IsOpen - check one tcp port
func IsOpen(host, port string) bool {

	timeout := 3 * time.Second
	target := net.JoinHostPort(host, port)

	conn, err := net.DialTimeout("tcp", target, timeout)
	if err != nil {
		return false
	}
	if cerr := conn.Close(); cerr != nil {
		slog.Debug("port close error", "target", target, "err", cerr)
	}
	return true
}
