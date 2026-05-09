package gdb

import (
	"errors"
	"net/netip"
	"sort"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// ListHosts - all devices, projected into the legacy host-shaped API view.
func ListHosts() (hosts []models.Host) {
	devices, err := loadDevices("")
	check.IfError(err)
	if err != nil {
		return hosts
	}

	hosts = make([]models.Host, 0, len(devices))
	for _, device := range devices {
		hosts = append(hosts, deviceToHost(device))
	}
	sort.Slice(hosts, func(i, j int) bool {
		return hosts[i].LastSeen.After(hosts[j].LastSeen)
	})
	return hosts
}

// ListHostsByIface - all devices that currently have an attachment on iface.
func ListHostsByIface(iface string) (hosts []models.Host) {
	for _, host := range ListHosts() {
		for _, attachment := range host.Attachments {
			if attachment.Iface == iface {
				hosts = append(hosts, host)
				break
			}
		}
	}
	return hosts
}

// GetHost - by UUID. Returns false if not found.
func GetHost(id string) (host models.Host, ok bool) {
	devices, err := loadDevices("devices.id = ?", id)
	if err != nil || len(devices) == 0 {
		return host, false
	}
	return deviceToHost(devices[0]), true
}

// GetHostByMAC - resolve the device by MAC identifier or attachment MAC.
func GetHostByMAC(mac string) (host models.Host, ok bool) {
	device, found := getDeviceByMAC(mac)
	if !found {
		return host, false
	}
	return deviceToHost(device), true
}

// EventsByMAC - latest N events for a MAC.
func EventsByMAC(mac string, limit int) (events []models.HostEvent) {
	q := db.Where("mac = ?", strings.ToLower(mac)).Order("ts DESC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	err := q.Find(&events).Error
	check.IfError(err)
	return events
}

// EventsByMACAndRange - events for MAC within [start, end).
func EventsByMACAndRange(mac string, start, end time.Time) (events []models.HostEvent) {
	err := db.
		Where("mac = ? AND ts >= ? AND ts < ?", strings.ToLower(mac), start, end).
		Order("ts DESC").
		Find(&events).Error
	check.IfError(err)
	return events
}

// AllEvents - full event log, latest first. Use with care; can be large.
func AllEvents() (events []models.HostEvent) {
	err := db.Order("ts DESC").Find(&events).Error
	check.IfError(err)
	return events
}

func loadDevices(where string, args ...any) ([]models.Device, error) {
	var devices []models.Device
	q := db.
		Preload("Identifiers").
		Preload("Attachments", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("last_seen DESC")
		}).
		Preload("Attachments.Network").
		Preload("Attachments.IPAddresses", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("preferred DESC, family ASC, last_seen DESC")
		}).
		Order("last_seen DESC")

	if where != "" {
		q = q.Where(where, args...)
	}
	err := q.Find(&devices).Error
	return devices, err
}

func getDeviceByMAC(mac string) (device models.Device, ok bool) {
	mac = strings.ToLower(mac)

	var identifier models.DeviceIdentifier
	err := db.First(&identifier, "kind = ? AND value = ?", models.IdentifierMAC, mac).Error
	if err == nil {
		devices, err := loadDevices("devices.id = ?", identifier.DeviceID)
		if err == nil && len(devices) == 1 {
			return devices[0], true
		}
	}

	var attachment models.NetworkAttachment
	err = db.Order("last_seen DESC").First(&attachment, "mac = ?", mac).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return device, false
	}
	check.IfError(err)
	if err != nil {
		return device, false
	}

	devices, err := loadDevices("devices.id = ?", attachment.DeviceID)
	if err != nil || len(devices) == 0 {
		return device, false
	}
	return devices[0], true
}

func deviceToHost(device models.Device) models.Host {
	host := models.Host{
		ID:        device.ID,
		Name:      device.DisplayName,
		Vendor:    device.Vendor,
		Known:     device.Known,
		FirstSeen: device.FirstSeen,
		LastSeen:  device.LastSeen,
	}

	for _, identifier := range device.Identifiers {
		if identifier.Kind == models.IdentifierMAC {
			host.Mac = identifier.Value
			break
		}
	}

	attachments := make([]models.HostAttachment, 0, len(device.Attachments))
	for _, attachment := range device.Attachments {
		view := models.HostAttachment{
			ID:          attachment.ID,
			NetworkID:   attachment.NetworkID,
			Network:     attachment.Network,
			Mac:         attachment.Mac,
			Iface:       attachment.IfaceLabel,
			Online:      attachment.Online,
			FirstSeen:   attachment.FirstSeen,
			LastSeen:    attachment.LastSeen,
			IPAddresses: attachment.IPAddresses,
		}
		attachments = append(attachments, view)
		if attachment.Online {
			host.Online = true
		}
		if host.Mac == "" && attachment.Mac != "" {
			host.Mac = attachment.Mac
		}
	}
	host.Attachments = attachments

	primary := pickPrimaryAttachment(attachments)
	if primary != nil {
		host.Iface = primary.Iface
		host.Mac = firstNonEmpty(host.Mac, primary.Mac)
		if ip := pickPrimaryIPAddress(primary.IPAddresses); ip != nil {
			host.IP = ip.Address
		}
	}

	return host
}

func pickPrimaryAttachment(attachments []models.HostAttachment) *models.HostAttachment {
	if len(attachments) == 0 {
		return nil
	}

	bestIdx := 0
	bestScore := attachmentScore(attachments[0])
	for i := 1; i < len(attachments); i++ {
		score := attachmentScore(attachments[i])
		if score > bestScore {
			bestIdx = i
			bestScore = score
		}
	}
	return &attachments[bestIdx]
}

func attachmentScore(attachment models.HostAttachment) int {
	score := 0
	if attachment.Online {
		score += 1000
	}
	if len(attachment.IPAddresses) > 0 {
		score += 100
	}
	for _, ip := range attachment.IPAddresses {
		if isIPv4(ip.Address) {
			score += 10
			break
		}
	}
	score += len(attachment.Iface)
	return score
}

func pickPrimaryIPAddress(addresses []models.IPAddress) *models.IPAddress {
	if len(addresses) == 0 {
		return nil
	}

	bestIdx := 0
	bestScore := ipScore(addresses[0])
	for i := 1; i < len(addresses); i++ {
		score := ipScore(addresses[i])
		if score > bestScore {
			bestIdx = i
			bestScore = score
		}
	}
	return &addresses[bestIdx]
}

func ipScore(ip models.IPAddress) int {
	score := 0
	if ip.Online {
		score += 1000
	}
	if ip.Preferred {
		score += 100
	}
	if ip.Family == models.IPFamilyV4 {
		score += 10
	}
	switch ip.Scope {
	case "global":
		score += 5
	case "ula":
		score += 3
	case "link_local":
		score += 1
	}
	return score
}

func isIPv4(raw string) bool {
	addr, err := netip.ParseAddr(raw)
	return err == nil && addr.Is4()
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
