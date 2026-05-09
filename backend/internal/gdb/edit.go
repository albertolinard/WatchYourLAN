package gdb

import (
	"net/netip"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// UpsertHost - create/update the authoritative normalized records from a host view.
func UpsertHost(h *models.Host) error {
	now := firstNonZero(h.LastSeen, h.FirstSeen, time.Now())

	device, found := getDeviceByMAC(h.Mac)
	if !found {
		device = models.Device{
			ID:          h.ID,
			DisplayName: h.Name,
			Vendor:      h.Vendor,
			Known:       h.Known,
			FirstSeen:   firstNonZero(h.FirstSeen, now),
			LastSeen:    now,
		}
		if err := db.Create(&device).Error; err != nil {
			check.IfError(err)
			return err
		}
	} else {
		if h.Name != "" {
			device.DisplayName = h.Name
		}
		if h.Vendor != "" {
			device.Vendor = h.Vendor
		}
		device.Known = h.Known
		if h.FirstSeen.IsZero() || device.FirstSeen.IsZero() {
			device.FirstSeen = firstNonZero(device.FirstSeen, h.FirstSeen, now)
		} else if h.FirstSeen.Before(device.FirstSeen) {
			device.FirstSeen = h.FirstSeen
		}
		device.LastSeen = maxTime(device.LastSeen, now)
		if err := db.Save(&device).Error; err != nil {
			check.IfError(err)
			return err
		}
	}

	if h.Mac != "" {
		if err := ensureDeviceIdentifier(device.ID, models.IdentifierMAC, strings.ToLower(h.Mac), "", 100, now); err != nil {
			return err
		}
	}
	if h.DNS != "" {
		if err := ensureDeviceIdentifier(device.ID, models.IdentifierDNS, h.DNS, "", 60, now); err != nil {
			return err
		}
	}

	if h.Iface != "" || h.IP != "" {
		if _, _, err := ensureAttachmentIPAddress(device, *h, now); err != nil {
			return err
		}
	}

	reloaded, ok := GetHost(device.ID)
	if ok {
		*h = reloaded
	}
	return nil
}

// SaveHost - update the device metadata represented by this derived host view.
func SaveHost(h *models.Host) error {
	var device models.Device
	err := db.First(&device, "id = ?", h.ID).Error
	check.IfError(err)
	if err != nil {
		return err
	}

	device.DisplayName = h.Name
	device.Vendor = firstNonEmpty(h.Vendor, device.Vendor)
	device.Known = h.Known
	device.LastSeen = maxTime(device.LastSeen, h.LastSeen)

	err = db.Save(&device).Error
	check.IfError(err)
	return err
}

// DeleteHost - by UUID.
func DeleteHost(id string) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var attachments []models.NetworkAttachment
		if err := tx.Where("device_id = ?", id).Find(&attachments).Error; err != nil {
			return err
		}
		attachmentIDs := make([]string, 0, len(attachments))
		for _, attachment := range attachments {
			attachmentIDs = append(attachmentIDs, attachment.ID)
		}
		if len(attachmentIDs) > 0 {
			if err := tx.Where("attachment_id IN ?", attachmentIDs).Delete(&models.IPAddress{}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("device_id = ?", id).Delete(&models.NetworkAttachment{}).Error; err != nil {
			return err
		}
		if err := tx.Where("device_id = ?", id).Delete(&models.DeviceIdentifier{}).Error; err != nil {
			return err
		}
		if err := tx.Where("host_id = ?", id).Delete(&models.HostEvent{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ?", id).Delete(&models.Device{}).Error
	})
}

// AddEvent - persist a host event.
func AddEvent(e *models.HostEvent) error {
	if e.Ts.IsZero() {
		e.Ts = time.Now()
	}
	e.Mac = strings.ToLower(e.Mac)
	res := db.Create(e)
	check.IfError(res.Error)
	return res.Error
}

// TrimEventsBefore - delete events older than cutoff. Returns rows removed.
func TrimEventsBefore(cutoff time.Time) int64 {
	res := db.Where("ts < ?", cutoff).Delete(&models.HostEvent{})
	check.IfError(res.Error)
	return res.RowsAffected
}

// ClearHosts - wipe the normalized host inventory. Used by tests/admin.
func ClearHosts() {
	res := db.Where("1 = 1").Delete(&models.IPAddress{})
	check.IfError(res.Error)
	res = db.Where("1 = 1").Delete(&models.NetworkAttachment{})
	check.IfError(res.Error)
	res = db.Where("1 = 1").Delete(&models.DeviceIdentifier{})
	check.IfError(res.Error)
	res = db.Where("1 = 1").Delete(&models.Network{})
	check.IfError(res.Error)
	res = db.Where("1 = 1").Delete(&models.Device{})
	check.IfError(res.Error)
}

// ClearEvents - wipe event log.
func ClearEvents() {
	res := db.Where("1 = 1").Delete(&models.HostEvent{})
	check.IfError(res.Error)
}

func ensureDeviceIdentifier(deviceID, kind, value, scope string, confidence int, seenAt time.Time) error {
	if value == "" {
		return nil
	}
	var identifier models.DeviceIdentifier
	err := db.First(&identifier, "kind = ? AND value = ? AND scope = ?", kind, value, scope).Error
	if err == nil {
		identifier.DeviceID = deviceID
		identifier.Confidence = confidence
		identifier.LastSeen = seenAt
		if identifier.FirstSeen.IsZero() {
			identifier.FirstSeen = seenAt
		}
		return db.Save(&identifier).Error
	}
	if err != gorm.ErrRecordNotFound {
		check.IfError(err)
		return err
	}
	identifier = models.DeviceIdentifier{
		DeviceID:   deviceID,
		Kind:       kind,
		Value:      value,
		Scope:      scope,
		Confidence: confidence,
		FirstSeen:  seenAt,
		LastSeen:   seenAt,
	}
	return db.Create(&identifier).Error
}

func ensureAttachmentIPAddress(device models.Device, host models.Host, seenAt time.Time) (models.NetworkAttachment, models.IPAddress, error) {
	network, err := ensureNetwork(host.Iface, seenAt)
	if err != nil {
		return models.NetworkAttachment{}, models.IPAddress{}, err
	}

	mac := strings.ToLower(host.Mac)
	attachment := models.NetworkAttachment{}
	q := db.Where("device_id = ? AND mac = ? AND iface_label = ?", device.ID, mac, host.Iface)
	if network.ID != "" {
		q = q.Where("network_id = ?", network.ID)
	} else {
		q = q.Where("network_id IS NULL")
	}
	err = q.First(&attachment).Error
	if err == nil {
		attachment.Online = host.Online
		attachment.LastSeen = seenAt
		attachment.FirstSeen = minTime(attachment.FirstSeen, firstNonZero(host.FirstSeen, seenAt))
	} else if err == gorm.ErrRecordNotFound {
		var networkID *string
		if network.ID != "" {
			networkID = &network.ID
		}
		attachment = models.NetworkAttachment{
			DeviceID:   device.ID,
			NetworkID:  networkID,
			Mac:        mac,
			IfaceLabel: host.Iface,
			Online:     host.Online,
			FirstSeen:  firstNonZero(host.FirstSeen, seenAt),
			LastSeen:   seenAt,
		}
		if err := db.Create(&attachment).Error; err != nil {
			check.IfError(err)
			return attachment, models.IPAddress{}, err
		}
	} else {
		check.IfError(err)
		return attachment, models.IPAddress{}, err
	}

	if attachment.ID != "" {
		if err := db.Save(&attachment).Error; err != nil {
			check.IfError(err)
			return attachment, models.IPAddress{}, err
		}
	}

	ip := models.IPAddress{}
	if host.IP == "" {
		return attachment, ip, nil
	}

	family, scope := classifyIPAddress(host.IP)
	err = db.First(&ip, "attachment_id = ? AND address = ?", attachment.ID, host.IP).Error
	if err == nil {
		ip.Family = family
		ip.Scope = scope
		ip.Online = host.Online
		ip.Preferred = true
		ip.LastSeen = seenAt
		ip.Source = firstNonEmpty(ip.Source, "scan")
	} else if err == gorm.ErrRecordNotFound {
		ip = models.IPAddress{
			AttachmentID: attachment.ID,
			Family:       family,
			Address:      host.IP,
			PrefixLen:    prefixLen(host.IP),
			Scope:        scope,
			Source:       "scan",
			Online:       host.Online,
			Preferred:    true,
			FirstSeen:    firstNonZero(host.FirstSeen, seenAt),
			LastSeen:     seenAt,
		}
		if err := db.Create(&ip).Error; err != nil {
			check.IfError(err)
			return attachment, ip, err
		}
	} else {
		check.IfError(err)
		return attachment, ip, err
	}

	if err := db.Model(&models.IPAddress{}).
		Where("attachment_id = ? AND id <> ?", attachment.ID, ip.ID).
		Update("preferred", false).Error; err != nil {
		check.IfError(err)
		return attachment, ip, err
	}
	if err := db.Save(&ip).Error; err != nil {
		check.IfError(err)
		return attachment, ip, err
	}
	return attachment, ip, nil
}

func ensureNetwork(iface string, seenAt time.Time) (models.Network, error) {
	if iface == "" {
		return models.Network{}, nil
	}

	var network models.Network
	err := db.First(&network, "l2_domain_key = ?", iface).Error
	if err == nil {
		network.LastSeen = seenAt
		err = db.Save(&network).Error
		return network, err
	}
	if err != gorm.ErrRecordNotFound {
		check.IfError(err)
		return network, err
	}

	network = models.Network{
		Name:        iface,
		L2DomainKey: iface,
		FirstSeen:   seenAt,
		LastSeen:    seenAt,
	}
	if vlan, ok := parseVLANID(iface); ok {
		network.VLANID = &vlan
	}
	err = db.Create(&network).Error
	check.IfError(err)
	return network, err
}

func classifyIPAddress(raw string) (family, scope string) {
	addr, err := netip.ParseAddr(raw)
	if err != nil {
		return "", ""
	}
	if addr.Is4() {
		return models.IPFamilyV4, "global"
	}
	family = models.IPFamilyV6
	switch {
	case addr.IsLinkLocalUnicast():
		scope = "link_local"
	case addr.IsPrivate():
		scope = "ula"
	case addr.IsLoopback():
		scope = "loopback"
	default:
		scope = "global"
	}
	return family, scope
}

func parseVLANID(iface string) (int, bool) {
	dot := strings.LastIndex(iface, ".")
	if dot < 0 || dot == len(iface)-1 {
		return 0, false
	}
	vlan, err := strconv.Atoi(iface[dot+1:])
	return vlan, err == nil
}

func prefixLen(raw string) int {
	addr, err := netip.ParseAddr(raw)
	if err != nil {
		return 0
	}
	if addr.Is4() {
		return 32
	}
	return 128
}

func minTime(a, b time.Time) time.Time {
	if a.IsZero() {
		return b
	}
	if b.IsZero() || a.Before(b) {
		return a
	}
	return b
}

func maxTime(a, b time.Time) time.Time {
	if a.IsZero() {
		return b
	}
	if b.After(a) {
		return b
	}
	return a
}
