package gdb

import (
	"strings"
	"time"

	"github.com/aceberg/WatchYourLAN/internal/check"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

// ApplyScan applies one full scan cycle to the normalized inventory model.
func ApplyScan(observations []models.Host, seenAt time.Time) error {
	previousHosts := ListHosts()
	previousByID := make(map[string]models.Host, len(previousHosts))
	for _, host := range previousHosts {
		previousByID[host.ID] = host
	}

	seenAttachments := map[string]bool{}
	seenIPs := map[string]bool{}
	seenDevices := map[string]bool{}

	for _, obs := range dedupeObservations(observations, seenAt) {
		existing, found := GetHostByMAC(obs.Mac)
		if !found || (obs.Name == "" && obs.DNS == "") {
			name, dns := check.DNS(obs)
			if obs.Name == "" {
				obs.Name = name
			}
			if obs.DNS == "" {
				obs.DNS = dns
			}
		}

		if err := UpsertHost(&obs); err != nil {
			return err
		}

		updated, ok := GetHost(obs.ID)
		if !ok {
			updated, _ = GetHostByMAC(obs.Mac)
		}
		if updated.ID == "" {
			continue
		}

		seenDevices[updated.ID] = true
		seenAttachments[attachmentKey(updated.ID, obs.Iface)] = true
		seenIPs[ipKey(updated.ID, obs.Iface, obs.IP)] = true

		if found && obs.IP != "" && !hostHasIP(existing, obs.IP) {
			_ = AddEvent(&models.HostEvent{
				HostID:   existing.ID,
				Mac:      existing.Mac,
				Ts:       seenAt,
				Kind:     models.EventIPChange,
				OldValue: existing.IP,
				NewValue: obs.IP,
			})
		}
	}

	currentHosts := ListHosts()
	for _, host := range currentHosts {
		prevOnline := previousByID[host.ID].Online
		nowOnline := false

		for _, attachment := range host.Attachments {
			aSeen := seenAttachments[attachmentKey(host.ID, attachment.Iface)]
			if aSeen {
				nowOnline = true
			}
			if err := setAttachmentOnlineState(attachment.ID, aSeen, seenAt); err != nil {
				return err
			}
			for _, ip := range attachment.IPAddresses {
				iSeen := seenIPs[ipKey(host.ID, attachment.Iface, ip.Address)]
				if err := setIPAddressOnlineState(ip.ID, iSeen, seenAt); err != nil {
					return err
				}
			}
		}

		switch {
		case !prevOnline && nowOnline:
			_ = AddEvent(&models.HostEvent{
				HostID: host.ID,
				Mac:    host.Mac,
				Ts:     seenAt,
				Kind:   models.EventOnline,
			})
		case prevOnline && !nowOnline:
			_ = AddEvent(&models.HostEvent{
				HostID: host.ID,
				Mac:    host.Mac,
				Ts:     seenAt,
				Kind:   models.EventOffline,
			})
		}
	}

	return nil
}

func dedupeObservations(observations []models.Host, seenAt time.Time) []models.Host {
	unique := make(map[string]models.Host, len(observations))
	for _, obs := range observations {
		obs.Mac = strings.ToLower(obs.Mac)
		obs.Online = true
		obs.FirstSeen = firstNonZero(obs.FirstSeen, seenAt)
		obs.LastSeen = firstNonZero(obs.LastSeen, seenAt)
		key := strings.Join([]string{obs.Mac, obs.Iface, obs.IP}, "|")
		unique[key] = obs
	}

	result := make([]models.Host, 0, len(unique))
	for _, obs := range unique {
		result = append(result, obs)
	}
	return result
}

func hostHasIP(host models.Host, ip string) bool {
	for _, attachment := range host.Attachments {
		for _, address := range attachment.IPAddresses {
			if address.Address == ip {
				return true
			}
		}
	}
	return false
}

func setAttachmentOnlineState(id string, online bool, seenAt time.Time) error {
	if id == "" {
		return nil
	}
	updates := map[string]any{"online": online}
	if online {
		updates["last_seen"] = seenAt
	}
	return db.Model(&models.NetworkAttachment{}).Where("id = ?", id).Updates(updates).Error
}

func setIPAddressOnlineState(id string, online bool, seenAt time.Time) error {
	if id == "" {
		return nil
	}
	updates := map[string]any{"online": online}
	if online {
		updates["last_seen"] = seenAt
	}
	return db.Model(&models.IPAddress{}).Where("id = ?", id).Updates(updates).Error
}

func attachmentKey(deviceID, iface string) string {
	return deviceID + "|" + iface
}

func ipKey(deviceID, iface, ip string) string {
	return deviceID + "|" + iface + "|" + ip
}
