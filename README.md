# Born2beRoot — README.md (full) + scripts + image instructions

> Files included in this document:
> - `README.md` (ready to submit)
> - `monitoring.sh` (bash monitoring script)
> - `monitoring.py` (Python monitoring script)
> - `diagram_generation.md` (instructions to produce a simple system diagram image)

---

## README.md (ready for submission)

```markdown
# Born2beRoot

**Author:** <your_login>
**Project:** Born2beRoot — 42 School

## Objective
Build a secure Debian virtual machine, correctly configured and documented. Use LVM with LUKS encryption, configure SSH/UFW, enforce password policies via PAM, provide monitoring and logging, and create a signature file for the VM image.

## VM & Installation
- Use VirtualBox (or similar) and Debian netinst ISO.
- Disk: 10–20 GB (VDI dynamic is ok).
- Use guided partitioning: set up LVM with encryption (LUKS).
- Create logical volumes for: `/boot` (outside LUKS), `/` , `/home`, `/var`, `/srv`, `/tmp`, `swap`.

## Users & Groups
- Create main user at install (e.g., `your_login`).
- Create group `user42` and add your user:
  ```bash
  sudo addgroup user42
  sudo usermod -aG user42 your_login
  ```

## Sudo
- Install sudo and add your user to the `sudo` group.
  ```bash
  su -
  apt update && apt install -y sudo
  usermod -aG sudo your_login
  ```
- Edit sudoers with `visudo` to add logging and limit tries. Example lines (use `visudo`):
  ```text
  Defaults        passwd_tries=3
  Defaults        logfile="/var/log/sudo/sudo.log"
  Defaults        log_input
  Defaults        log_output
  ```

## PAM Password Policy
Edit `/etc/pam.d/common-password` to include (example):
```
password requisite pam_pwquality.so retry=3 minlen=10 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1 maxrepeat=3 usercheck=1 difok=7
```
Set password aging (example):
```bash
sudo chage -M 30 your_login
sudo chage -m 2 your_login
sudo chage -W 7 your_login
```

## SSH
- Install OpenSSH server and edit `/etc/ssh/sshd_config`:
  - `Port 4242`
  - `PermitRootLogin no`
  - `PasswordAuthentication yes` (or `no` if using keys)
- Restart SSH: `sudo systemctl restart ssh`.

## UFW Firewall
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 4242/tcp
sudo ufw enable
```

## Monitoring Script (see `monitoring.sh` or `monitoring.py`)
- Place script in `/usr/local/bin/monitoring.sh` and make executable.
- Add cron to run every 10 minutes for root:
```
*/10 * * * * /usr/local/bin/monitoring.sh
```

## Logs & Checks for Evaluation
Common commands to show during the exam:
```bash
lsblk
sudo lvdisplay
sudo vgdisplay
sudo pvdisplay
sudo ufw status verbose
ss -tunlp
sudo -l
chage -l your_login
sudo crontab -u root -l
tail -n 20 /var/log/sudo/sudo.log
```

## Signature File (on host)
On the host machine, compute the image checksum:
```bash
shasum -a 256 Born2BeRoot.vdi > signature.txt
```

## Bonus (Optional)
- Install Nginx, set self-signed TLS.
- Disable password auth for SSH and use keys.
- Harden PAM and sysctl settings.
```

---

## monitoring.sh (bash) — place in `/usr/local/bin/monitoring.sh`

```bash
#!/bin/bash
# Born2beRoot monitoring script — minimal and exam-friendly

ARCH="$(uname -a)"
CPU_PHYSICAL="$(lscpu | awk -F: '/^Socket\(s\)/ {print $2; exit}' | xargs)"
VCPU="$(grep -c ^processor /proc/cpuinfo)"
RAM_USED_MB=$(free -m | awk '/^Mem:/ {print $3}')
RAM_TOTAL_MB=$(free -m | awk '/^Mem:/ {print $2}')
RAM_PERCENT=$((RAM_USED_MB * 100 / RAM_TOTAL_MB))
DISK_USAGE="$(df -h --output=used,size,pcent / | tail -n1 | xargs)"
CPU_LOAD="$(top -bn1 | awk '/Cpu\(s\)/ {print $2 + $4}')"
LAST_BOOT="$(who -b | awk '{print $3" "$4}')"
LVM_USE_COUNT="$(lsblk | grep -c lvm)"
TCP_CONN_ESTAB="$(ss -s | awk '/estab/ {print $2}')"
USERS_LOGGED="$(who | awk '{print $1}' | sort -u | wc -l)"
IP_ADDR="$(hostname -I | awk '{print $1}')"
MAC_ADDR="$(ip link show | awk '/ether/ {print $2; exit}')"
SUDO_CMDS="0"
SUDO_LOG="/var/log/sudo/sudo.log"
if [ -f "$SUDO_LOG" ]; then
  SUDO_CMDS=$(grep -c COMMAND "$SUDO_LOG" || echo 0)
fi

cat <<EOF
# Architecture: $ARCH
# Physical CPUs: $CPU_PHYSICAL
# vCPUs: $VCPU
# Memory Usage: ${RAM_USED_MB}MB / ${RAM_TOTAL_MB}MB (${RAM_PERCENT}%)
# Disk Usage (root): $DISK_USAGE
# CPU Load (%): $CPU_LOAD
# Last Boot: $LAST_BOOT
# LVM in use (count): $LVM_USE_COUNT
# TCP established connections: $TCP_CONN_ESTAB
# Users logged (unique): $USERS_LOGGED
# Network: IP $IP_ADDR | MAC $MAC_ADDR
# Sudo commands logged: $SUDO_CMDS
EOF

# Optional: broadcast to all users (comment/uncomment to enable)
# wall "$(cat /tmp/last_monitor || echo '')"

# Save last output to /tmp/last_monitor
mkdir -p /tmp
cat <<EOF > /tmp/last_monitor
# Architecture: $ARCH
# Physical CPUs: $CPU_PHYSICAL
# vCPUs: $VCPU
# Memory Usage: ${RAM_USED_MB}MB / ${RAM_TOTAL_MB}MB (${RAM_PERCENT}%)
# Disk Usage (root): $DISK_USAGE
# CPU Load (%): $CPU_LOAD
# Last Boot: $LAST_BOOT
# LVM in use (count): $LVM_USE_COUNT
# TCP established connections: $TCP_CONN_ESTAB
# Users logged (unique): $USERS_LOGGED
# Network: IP $IP_ADDR | MAC $MAC_ADDR
# Sudo commands logged: $SUDO_CMDS
EOF
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/monitoring.sh
```

Add to root cron:
```bash
sudo crontab -u root -e
# add:
*/10 * * * * /usr/local/bin/monitoring.sh
```

---

## monitoring.py (alternative Python version)

```python
#!/usr/bin/env python3
"""Simple monitoring script for Born2beRoot — prints system info."""
import subprocess
import shutil

def sh(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

info = {}
info['architecture'] = sh('uname -a')
info['vcpus'] = sh("grep -c ^processor /proc/cpuinfo")
mem = sh("free -m | awk '/^Mem:/ {print $3"," $2}'")
used, total = mem.split(',')
info['memory'] = f"{used}MB / {total}MB"
info['disk'] = sh("df -h --output=used,size,pcent / | tail -n1 | xargs")
info['last_boot'] = sh("who -b | awk '{print $3 \" \" $4}'")
info['ip'] = sh("hostname -I | awk '{print $1}'")
info['mac'] = sh("ip link show | awk '/ether/ {print $2; exit}'")

print('# Architecture:', info['architecture'])
print('# vCPUs:', info['vcpus'])
print('# Memory:', info['memory'])
print('# Disk (root):', info['disk'])
print('# Last boot:', info['last_boot'])
print('# IP:', info['ip'])
print('# MAC:', info['mac'])

# optional: write to /tmp/last_monitor
with open('/tmp/last_monitor_py', 'w') as f:
    for k, v in info.items():
        f.write(f"{k}: {v}\n")
```

Make executable and add to cron same as above.

---

## diagram_generation.md (create a simple image for your README)

You might want a small diagram (PNG) that shows the VM -> LUKS -> LVM -> LVs structure. Two easy ways:

1. **Graphviz (recommended)**

Create `diagram.dot`:

```
digraph G {
  VM -> Disk;
  Disk -> LUKS;
  LUKS -> PV;
  PV -> VG;
  VG -> LV_root [label="/ (root)"];
  VG -> LV_home [label="/home"];
  VG -> LV_var [label="/var"];
  VG -> LV_srv [label="/srv"];
  VG -> LV_tmp [label="/tmp"];
}
```

Render to PNG:

```bash
sudo apt install -y graphviz
dot -Tpng diagram.dot -o diagram.png
```

2. **Use ASCII diagram** (if no graphics allowed). Example in README:

```
[VM]
  └─ /dev/sda
      └─ LUKS (cryptroot)
          └─ LVM PV
              └─ VG: vg0
                  ├─ LV: root (/)
                  ├─ LV: home (/home)
                  ├─ LV: var (/var)
                  └─ LV: tmp (/tmp)
```

---

## How to use these files
- Copy `README.md` content into a file named `README.md` for submission.
- Put `monitoring.sh` in `/usr/local/bin/` and make executable.
- (Optional) Put `monitoring.py` in the same folder if you prefer Python.
- Generate the diagram with Graphviz and attach `diagram.png` to your submission if required.

Good luck — ask me to: `give me the README file` or `give me monitoring.sh file` if you want direct downloadable files.
