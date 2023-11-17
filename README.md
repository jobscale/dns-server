# nameserver with dnsmasq

## Install

```
sudo apt update
sudo apt install -y dnsmasq
```

## Config

```
echo "expand-hosts" | sudo tee -a /etc/dnsmasq.d/custom.conf
```

## Start daemon

```
sudo /etc/init.d/dnsmasq start
```

# nameserver with systemd-resolved

```
sudo ./portForwardDNS
```

## docker examples

```
docker run --name dns --restart always -p 53:53 -p 53:53/udp -d ghcr.io/jobscale/nameserver
```
