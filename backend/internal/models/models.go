package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Conf - app config
type Conf struct {
	Host     string
	Port     string
	Theme    string
	Color    string
	DirPath  string
	ConfPath string
	NodePath string
	LogLevel string
	Ifaces   string
	ArpArgs  string
	ArpStrs  []string
	Timeout  int
	TrimHist int
	ShoutURL string
	Version  string
	// PostgreSQL (required)
	PGConnect string
	// InfluxDB
	InfluxEnable  bool
	InfluxAddr    string
	InfluxToken   string
	InfluxOrg     string
	InfluxBucket  string
	InfluxSkipTLS bool
	// Prometheus
	PrometheusEnable bool
}

// HostAttachment - network presence and its observed IPs.
type HostAttachment struct {
	ID          string      `gorm:"-" json:"id"`
	NetworkID   *string     `gorm:"-" json:"network_id,omitempty"`
	Network     *Network    `gorm:"-" json:"network,omitempty"`
	Mac         string      `gorm:"-" json:"mac"`
	Iface       string      `gorm:"-" json:"iface"`
	Online      bool        `gorm:"-" json:"online"`
	FirstSeen   time.Time   `gorm:"-" json:"first_seen"`
	LastSeen    time.Time   `gorm:"-" json:"last_seen"`
	IPAddresses []IPAddress `gorm:"-" json:"ip_addresses,omitempty"`
}

// Host - derived API view of a device.
type Host struct {
	ID          string           `gorm:"-" json:"id"`
	Mac         string           `gorm:"-" json:"mac"`
	Name        string           `gorm:"-" json:"name"`
	Vendor      string           `gorm:"-" json:"vendor"`
	Iface       string           `gorm:"-" json:"iface"`
	IP          string           `gorm:"-" json:"ip"`
	DNS         string           `gorm:"-" json:"dns"`
	Known       bool             `gorm:"-" json:"known"`
	Online      bool             `gorm:"-" json:"online"`
	FirstSeen   time.Time        `gorm:"-" json:"first_seen"`
	LastSeen    time.Time        `gorm:"-" json:"last_seen"`
	Attachments []HostAttachment `gorm:"-" json:"attachments,omitempty"`
}

// Device - canonical endpoint identity. A device can have many identifiers,
// many network attachments, and many IP addresses through those attachments.
type Device struct {
	ID          string              `gorm:"type:uuid;primaryKey" json:"id"`
	DisplayName string              `json:"display_name"`
	Vendor      string              `json:"vendor"`
	Known       bool                `gorm:"index" json:"known"`
	FirstSeen   time.Time           `json:"first_seen"`
	LastSeen    time.Time           `gorm:"index" json:"last_seen"`
	Notes       string              `json:"notes"`
	Identifiers []DeviceIdentifier  `gorm:"foreignKey:DeviceID" json:"identifiers,omitempty"`
	Attachments []NetworkAttachment `gorm:"foreignKey:DeviceID" json:"attachments,omitempty"`
}

// BeforeCreate - assign UUID if missing.
func (d *Device) BeforeCreate(_ *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.NewString()
	}
	return nil
}

// Device identifier kinds.
const (
	IdentifierMAC         = "mac"
	IdentifierHostname    = "hostname"
	IdentifierDNS         = "dns"
	IdentifierAgentID     = "agent_id"
	IdentifierFingerprint = "fingerprint"
)

// DeviceIdentifier - an identifier that can resolve to a device.
type DeviceIdentifier struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	DeviceID   string    `gorm:"type:uuid;index;not null" json:"device_id"`
	Kind       string    `gorm:"uniqueIndex:uq_identifier_lookup,priority:1;not null" json:"kind"`
	Value      string    `gorm:"uniqueIndex:uq_identifier_lookup,priority:2;not null" json:"value"`
	Scope      string    `gorm:"uniqueIndex:uq_identifier_lookup,priority:3;not null;default:''" json:"scope"`
	Confidence int       `json:"confidence"`
	FirstSeen  time.Time `json:"first_seen"`
	LastSeen   time.Time `gorm:"index" json:"last_seen"`
}

// BeforeCreate - assign UUID if missing.
func (di *DeviceIdentifier) BeforeCreate(_ *gorm.DB) error {
	if di.ID == "" {
		di.ID = uuid.NewString()
	}
	return nil
}

// Network - normalized network segment metadata.
type Network struct {
	ID          string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `json:"name"`
	CIDR        string    `json:"cidr"`
	VLANID      *int      `gorm:"index" json:"vlan_id,omitempty"`
	VRF         string    `json:"vrf"`
	Site        string    `json:"site"`
	L2DomainKey string    `gorm:"index" json:"l2_domain_key"`
	FirstSeen   time.Time `json:"first_seen"`
	LastSeen    time.Time `gorm:"index" json:"last_seen"`
}

// BeforeCreate - assign UUID if missing.
func (n *Network) BeforeCreate(_ *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}
	return nil
}

// NetworkAttachment - a device's presence on a network.
type NetworkAttachment struct {
	ID          string      `gorm:"type:uuid;primaryKey" json:"id"`
	DeviceID    string      `gorm:"type:uuid;index;not null" json:"device_id"`
	NetworkID   *string     `gorm:"type:uuid;index" json:"network_id,omitempty"`
	Mac         string      `gorm:"index" json:"mac"`
	IfaceLabel  string      `gorm:"index" json:"iface_label"`
	Online      bool        `gorm:"index" json:"online"`
	FirstSeen   time.Time   `json:"first_seen"`
	LastSeen    time.Time   `gorm:"index" json:"last_seen"`
	Network     *Network    `gorm:"foreignKey:NetworkID" json:"network,omitempty"`
	IPAddresses []IPAddress `gorm:"foreignKey:AttachmentID" json:"ip_addresses,omitempty"`
}

// BeforeCreate - assign UUID if missing.
func (na *NetworkAttachment) BeforeCreate(_ *gorm.DB) error {
	if na.ID == "" {
		na.ID = uuid.NewString()
	}
	return nil
}

// IP address families.
const (
	IPFamilyV4 = "ipv4"
	IPFamilyV6 = "ipv6"
)

// IPAddress - one address observed on a network attachment.
type IPAddress struct {
	ID           string    `gorm:"type:uuid;primaryKey" json:"id"`
	AttachmentID string    `gorm:"type:uuid;index;not null" json:"attachment_id"`
	Family       string    `gorm:"index" json:"family"`
	Address      string    `gorm:"type:inet;index;not null" json:"address"`
	PrefixLen    int       `json:"prefix_len"`
	Scope        string    `json:"scope"`
	Source       string    `json:"source"`
	Online       bool      `gorm:"index" json:"online"`
	Preferred    bool      `json:"preferred"`
	FirstSeen    time.Time `json:"first_seen"`
	LastSeen     time.Time `gorm:"index" json:"last_seen"`
}

// BeforeCreate - assign UUID if missing.
func (ip *IPAddress) BeforeCreate(_ *gorm.DB) error {
	if ip.ID == "" {
		ip.ID = uuid.NewString()
	}
	return nil
}

// EventKind - host_events.kind enum.
type EventKind string

const (
	EventOnline       EventKind = "online"
	EventOffline      EventKind = "offline"
	EventIPChange     EventKind = "ip_change"
	EventRenamed      EventKind = "renamed"
	EventKnownToggled EventKind = "known_toggled"
)

// HostEvent - state transition for a host.
// Mac is denormalized so events survive host deletion and queries skip the join.
type HostEvent struct {
	ID       string    `gorm:"type:uuid;primaryKey" json:"id"`
	HostID   string    `gorm:"type:uuid;index" json:"host_id"`
	Mac      string    `gorm:"index;not null" json:"mac"`
	Ts       time.Time `gorm:"index;not null" json:"ts"`
	Kind     EventKind `gorm:"type:varchar(32);not null;index" json:"kind"`
	OldValue string    `json:"old_value,omitempty"`
	NewValue string    `json:"new_value,omitempty"`
}

// BeforeCreate - assign UUID if missing.
func (e *HostEvent) BeforeCreate(_ *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.NewString()
	}
	return nil
}

// Stat - dashboard summary.
type Stat struct {
	Total   int `json:"total"`
	Online  int `json:"online"`
	Offline int `json:"offline"`
	Known   int `json:"known"`
	Unknown int `json:"unknown"`
}
