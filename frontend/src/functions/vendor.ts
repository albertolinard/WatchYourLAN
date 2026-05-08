// Map hardware description keywords to Bootstrap icons
const hwIcons: Record<string, string> = {
  // Networking
  "router":     "bi-router",
  "switch":     "bi-router-fill",
  "access point": "bi-wifi",
  "gateway":    "bi-router",
  "firewall":   "bi-shield-lock",
  "ubiquiti":   "bi-router",
  "mikrotik":   "bi-router",
  "tp-link":    "bi-router",
  "netgear":    "bi-router",
  "asus":       "bi-router",
  "d-link":     "bi-router",
  "linksys":    "bi-router",
  "cisco":      "bi-router",
  "juniper":    "bi-router",

  // Computers
  "apple":      "bi-laptop",
  "macbook":    "bi-laptop",
  "imac":       "bi-display",
  "dell":       "bi-pc-display",
  "lenovo":     "bi-pc-display",
  "hp inc":     "bi-printer",
  "hp ":        "bi-pc-display",
  "microsoft":  "bi-pc-display",
  "intel":      "bi-cpu",
  "amd":        "bi-cpu",

  // Mobile
  "samsung":    "bi-phone",
  "huawei":     "bi-phone",
  "xiaomi":     "bi-phone",
  "oneplus":    "bi-phone",
  "pixel":      "bi-phone",
  "iphone":     "bi-phone",
  "motorola":   "bi-phone",
  "oppo":       "bi-phone",
  "vivo":       "bi-phone",

  // IoT / Smart Home
  "espressif":  "bi-cpu",
  "shelly":     "bi-plug",
  "tasmota":    "bi-plug",
  "zigbee":     "bi-lightning",
  "sonoff":     "bi-plug",
  "ring":       "bi-camera",
  "nest":       "bi-thermometer",
  "amazon":     "bi-speaker",
  "google":     "bi-speaker",
  "echo":       "bi-speaker",
  "philips":    "bi-lightbulb",
  "tuya":       "bi-plug",

  // Printers
  "printer":    "bi-printer",
  "epson":      "bi-printer",
  "brother":    "bi-printer",
  "canon":      "bi-printer",
  "ricoh":      "bi-printer",

  // Storage/NAS
  "synology":   "bi-hdd",
  "qnap":       "bi-hdd",
  "nas":        "bi-hdd",

  // Servers
  "supermicro": "bi-server",
  "proxmox":    "bi-server",
  "vmware":     "bi-server",
  "virtual":    "bi-server",
  "docker":     "bi-box-seam",

  // Cameras
  "hikvision":  "bi-camera-video",
  "dahua":      "bi-camera-video",
  "camera":     "bi-camera-video",
  "reolink":    "bi-camera-video",

  // Media
  "roku":       "bi-tv",
  "chromecast":  "bi-tv",
  "sony":       "bi-tv",
  "lg ":        "bi-tv",
  "samsung tv":  "bi-tv",

  // Game consoles
  "playstation": "bi-controller",
  "xbox":       "bi-controller",
  "nintendo":   "bi-controller",
};

// Per-vendor OUI prefix lists (avoids duplicate key issues)
const vendorOUIs: Record<string, string[]> = {
  "Apple": [
    "00:03:93","00:0A:27","00:0A:95","00:0D:93","00:10:FA","00:11:24",
    "00:14:51","00:16:CB","00:17:F2","00:19:E3","00:1B:63","00:1C:B3",
    "00:1D:4A","00:1E:52","00:1E:C2","00:1F:5B","00:1F:71","00:21:E9",
    "00:22:41","00:23:12","00:23:32","00:23:6C","00:23:DF","00:24:36",
    "00:25:00","00:25:4B","00:25:BC","00:26:08","00:26:4A","00:26:B0",
    "00:26:BB","00:30:65","00:A0:40","00:A4:2A","04:0C:CE","04:1E:64",
    "08:1D:2A","08:66:98","0C:1A:4D","10:40:F3","14:10:9F","14:1A:A3",
    "18:1C:6E","18:34:51","18:7B:9D","18:E7:28","1C:1A:C0","1C:36:AA",
    "1C:42:28","1C:4B:0D","1C:5C:F2","1C:67:58","1C:72:2F","1C:AB:A7",
    "20:3C:AE","20:68:9D","24:0A:64","24:4B:FE","24:62:2A","24:9E:8F",
    "24:A0:74","24:AB:2B","24:C6:94","24:F0:94","28:0A:ED","28:1B:2E",
    "28:37:37","28:4D:21","28:5A:EB","28:6A:BA","28:78:93","28:A0:2B",
    "28:A4:2C","28:BD:89","28:C2:DD","28:C6:8E","28:CA:6A","28:E0:2C",
    "28:F0:76","2C:1F:23","2C:20:0B","2C:33:7A","2C:3B:70","2C:56:DC",
    "2C:57:31","2C:7B:84","2C:8B:56","2C:9E:59","2C:A0:5D","2C:A4:1F",
    "2C:B0:5D","2C:B6:8A","2C:C9:1C","2C:F0:5D","2C:F4:C5","30:10:E4",
    "30:63:6B","30:8A:09","30:90:AB","30:AE:7B","30:C6:52","30:D2:C1",
    "30:F7:C5","34:12:F9","34:23:87","34:36:5C","34:42:54","34:51:C9",
    "34:63:8C","34:78:3F","34:7C:8C","34:87:BA","34:8A:AE","34:95:5B",
    "34:A3:95","34:C0:39","34:C7:9F","34:D0:50","34:D2:70","34:E2:3B",
    "34:F3:9A","34:FA:4B","38:0A:25","38:1B:11","38:2D:63","38:4A:1E",
    "38:6B:1C","38:7C:76","38:87:D5","38:8B:12","38:9A:DC","38:A4:ED",
    "38:C6:4F","38:C9:86","38:CA:D8","38:E7:D8","38:F9:E4","3C:06:30",
    "3C:15:B1","3C:22:FB","3C:2E:F9","3C:3E:67","3C:46:3B","3C:4A:53",
    "3C:61:05","3C:7C:3A","3C:88:20","3C:8B:2A","3C:A0:12","3C:A6:2B",
    "3C:B1:D5","3C:C2:43","3C:D0:3B","3C:D0:F8","3C:E0:4D","3C:E5:A6",
    "3C:ED:3F","3C:F0:88","40:3C:FC","40:4D:7F","40:6C:8F","40:9B:9D",
    "40:A6:D9","40:AE:7C","40:B3:5C","40:B8:37","40:CB:C0","40:D3:2D",
    "40:E6:CB","40:F4:FD","44:2A:60","44:3B:D4","44:4C:C8","44:59:93",
    "44:6E:1E","44:74:6B","44:76:47","44:78:58","44:80:7B","44:87:38",
    "44:8A:5B","44:90:CA","44:98:2B","44:A5:6B","44:B7:3F","44:D7:8D",
    "44:E3:5C","44:E8:6A","44:FB:3E","48:0A:1E","48:21:0B","48:24:1D",
    "48:3B:38","48:43:7C","48:4F:E5","48:5B:39","48:60:BC","48:64:B1",
    "48:6D:BB","48:7C:3E","48:85:A7","48:8E:9D","48:A1:95","48:A3:58",
    "48:A6:D8","48:A8:6B","48:B2:5D","48:C2:2B","48:C9:76","48:CF:3B",
    "48:D1:35","48:D2:42","48:D3:1B","48:E7:DA","48:F0:7B","48:F2:CA",
    "48:F4:11","48:F8:4D","48:FA:2E","48:FC:9D","48:FE:CE","4C:11:BF",
    "4C:20:59","4C:32:75","4C:57:CA","4C:7C:3C","4C:8D:66","4C:96:1D",
    "4C:9A:36","4C:A2:BE","4C:B1:6C","4C:B4:78","4C:BD:46","4C:C0:1A",
    "4C:C3:2B","4C:D1:3B","4C:D6:EC","4C:E0:26","4C:E4:60","4C:E6:76",
    "4C:EF:C0","4C:F0:A9","4C:F2:31","4C:F4:6D","4C:FA:5A","4C:FD:2A",
    "50:1E:2D","50:2B:9E","50:32:37","50:4A:6E","50:56:A9","50:5E:1A",
    "50:6A:03","50:7A:C5","50:7D:7A","50:85:8B","50:87:40","50:89:AA",
    "50:8A:05","50:8E:E6","50:9E:41","50:A0:09","50:A4:15","50:A6:7F",
    "50:B0:23","50:B4:1D","50:BC:96","50:C2:B8","50:C7:1B","50:D2:F3",
    "50:D4:1E","50:D7:3F","50:DA:4A","50:DC:8B","50:E0:BB","50:E5:49",
    "50:E8:6F","50:ED:3C","50:F0:AB","50:F2:A1","50:F4:1C","50:F5:DA",
    "50:F7:E3","50:FA:84","50:FC:9F","50:FD:52","50:FF:47",
  ],
  "Samsung": [
    "00:12:FB","00:15:99","00:16:6B","00:17:C1","00:18:AF","00:1A:8A",
    "00:1B:98","00:1D:2B","00:1E:7D","00:1F:B6","00:22:15","00:24:5E",
    "00:25:66","00:26:37","00:27:13","00:7C:91","04:0E:3D","0C:23:55",
    "0C:61:CF","0C:89:A5","10:3E:72","10:68:3F","10:A5:00","10:D5:41",
    "14:2D:0B","14:5C:7A","14:7A:33","14:91:82","14:A1:19","14:B4:1F",
    "18:04:09","18:0E:6A","18:1D:EA","18:4B:1D","18:5D:9B","18:7B:E3",
    "18:9C:28","18:A0:76","18:C5:8C","18:E8:B8","1C:4A:17","1C:B9:C4",
    "20:20:3C","20:3C:8A","20:5C:5A","20:89:86","20:A6:05","20:A6:CD",
    "20:B0:5C","24:0D:3C","24:1B:6D","24:2A:B1","24:4A:8A","24:5D:71",
    "24:85:1E","24:B8:5E","24:D5:1C","28:D0:EA","28:E3:47","2C:0E:3D",
    "2C:54:CF","2C:5D:93","2C:7C:53","2C:A0:3E","30:6D:B8","30:7E:6B",
    "30:9C:23","30:B5:C2","30:CD:9C","34:23:BA","34:2A:E1","34:41:5A",
    "34:4D:D3","34:69:87","34:7E:F3","34:8B:20","34:B1:F2","34:C7:3F",
    "34:D5:A7","38:16:D1","38:2C:4A","38:3B:26","38:4F:42","38:7A:DB",
    "38:AA:7C","38:C9:43","38:CC:8D","38:E8:E7","3C:07:54","3C:10:8B",
    "3C:5A:9E","3C:A6:5B","3C:E0:A1","40:0C:F1","40:1B:7D","40:2C:FB",
    "40:3A:2E","40:4D:8A","40:74:E7","40:9C:28","40:D3:AE","44:65:0D",
    "44:73:D6","44:A1:5B","44:C3:06","44:E6:3C","48:0E:EC","48:4D:7C",
    "48:62:77","48:7B:9C","48:95:22","48:9A:D2","48:A4:72","48:C2:3E",
    "48:D2:24","48:E5:2C","4C:60:DE","4C:6A:8C","4C:8B:7E","4C:AA:16",
    "4C:BB:58","50:1D:E5","50:2E:5C","50:56:50","50:64:2B","50:7A:55",
    "50:A6:BF","50:B7:6B","50:C5:6E","50:DC:E7",
  ],
  "Intel": [
    "00:02:B3","00:03:47","00:04:23","00:07:E9","00:0E:0C","00:0F:B0",
    "00:11:11","00:13:20","00:13:CE","00:15:17","00:16:17","00:17:DB",
    "00:18:8B","00:19:D1","00:1A:A0","00:1B:21","00:1C:3E","00:1D:72",
    "00:1E:64","00:1F:3B","00:21:5C","00:22:1F","00:23:14","00:24:D6",
    "00:26:55","00:27:0E","00:50:2D","00:50:8D","00:53:02","00:59:7A",
    "00:5C:88","00:75:1B","00:A0:C9","00:C0:F0","00:D0:B7","00:E0:18",
    "00:E0:4C","00:E0:81","08:1F:F3","0C:54:A5","10:4B:56","18:1F:62",
    "1C:39:74","1C:6A:A2","1C:7A:51","1C:BD:01","20:47:58","2C:44:FD",
    "2C:BE:08","30:5A:36","34:17:4E","34:2C:3B","34:40:B5","34:96:72",
    "38:D4:3C","3C:A9:F4","40:1C:83","40:6B:3F","44:1C:A3","4C:79:6E",
    "50:7B:6D","54:BF:64","58:00:BB","58:69:6B","5C:79:6E","5C:8A:8B",
    "60:45:BD","60:6D:3C","64:4B:80","68:05:CA","6C:4E:25","70:85:C2",
    "74:E5:43","78:19:F6","78:92:9C","7A:79:6E","7C:2A:DB","7C:79:6E",
    "80:5E:C0","84:8F:69","88:1F:A4","8C:16:45","8C:70:55","90:B2:1F",
    "94:C6:91","98:3B:8F","98:5A:EB","9C:B6:D0","A0:36:9F","A0:5E:F0",
    "A4:4C:C8","AC:1F:6B","AC:7B:2A","B0:3A:2A","B4:2E:99","B4:99:BA",
    "B8:AC:6F","BC:29:71","BC:77:37","C0:3F:D5","C8:1F:66","CC:2D:8A",
    "D0:50:99","D4:BE:D9","D8:9E:F3","DC:A6:32","E0:69:95","E4:C2:5D",
    "F0:45:DA","F4:6D:04","F8:B1:56","FC:2F:4F","FC:AA:14",
  ],
  "Espressif": [
    "24:0A:C4","30:AE:A4","3C:71:BF","40:F5:20","54:5E:BD","5C:CF:7F",
    "60:01:94","68:C6:3A","7C:DF:A1","84:0D:8E","90:97:8A","94:B9:7A",
    "9C:9C:1F","A0:20:A6","AC:15:18","B4:E6:2D","BC:DD:C2","C4:5B:BE",
    "CC:50:E3","D8:A0:1D","DC:4F:22","E0:5A:1B","EC:94:CB","F0:9F:C2",
    "FC:F5:C4",
  ],
  "Shelly": [
    "EC:FA:BC","E8:DB:84",
  ],
  "Ubiquiti": [
    "04:18:D6","06:18:D6","18:E8:29","44:D9:E7","48:8B:3A","50:D7:2B",
    "52:03:2B","60:22:32","68:72:51","6C:6E:40","70:A7:41","74:83:63",
    "78:8A:20","78:8A:8C","80:2A:A8","88:1E:35","90:3C:07","9C:05:23",
    "AC:8B:A9","B4:5D:57","C4:7B:5C","CC:27:1D","D0:21:F9","D4:6E:E0",
    "DC:9F:DA","E0:63:DA","E4:1E:8A","F0:FC:43","FC:EC:DA",
  ],
  "TP-Link": [
    "50:3E:AA","54:A7:03","5C:62:8B","60:32:B1","64:66:E3","6C:5A:30",
    "70:4F:57","74:DA:88","78:44:FD","7C:8B:CA","90:9A:4A","94:2F:CC",
    "98:48:27","98:DE:D0","9C:A2:F4","A0:4E:04","A4:56:02","AC:22:0B",
    "B0:4E:26","B4:B5:FE","C0:06:C3","CC:34:29","D0:76:58","D8:32:14",
    "DC:FE:18","E8:48:B8","EC:17:2F","F0:F6:1B","F4:F2:6D","FC:7C:01",
  ],
};

// Build a flat lookup map from per-vendor lists
const ouiMap: Record<string, string> = {};
for (const [vendor, prefixes] of Object.entries(vendorOUIs)) {
  for (const prefix of prefixes) {
    ouiMap[prefix] = vendor;
  }
}

export function vendorIcon(hw: string, mac: string): string {
  const hwLower = (hw || "").toLowerCase();

  // Check hardware description keywords first
  for (const [keyword, icon] of Object.entries(hwIcons)) {
    if (hwLower.includes(keyword.toLowerCase())) {
      return icon;
    }
  }

  // Check MAC OUI
  const oui = (mac || "").toUpperCase().slice(0, 8);
  const vendor = ouiMap[oui];
  if (vendor) {
    const vendorLower = vendor.toLowerCase();
    for (const [keyword, icon] of Object.entries(hwIcons)) {
      if (vendorLower.includes(keyword.toLowerCase())) {
        return icon;
      }
    }
  }

  return "bi-pc-display";
}

export function vendorName(mac: string): string {
  const oui = (mac || "").toUpperCase().slice(0, 8);
  return ouiMap[oui] || "";
}