package collector

import (
	"fmt"
	"os"
	"strings"
)

type Metrics struct {
	Hostname           string
	OSInfo             string
	IPAddress          string
	CPUUsagePercent    float64
	MemoryUsagePercent float64
	MemoryUsedMB       float64
	MemoryTotalMB      float64
	DiskUsagePercent   float64
	DiskUsedGB         float64
	DiskTotalGB        float64
	NetworkBytesSent   float64
	NetworkBytesRecv   float64
}

func Collect() (*Metrics, []error) {
	m := &Metrics{}
	var errors []error

	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}
	m.Hostname = hostname

	m.OSInfo = getOSInfo()

	cpuStats, err := CollectCPU()
	if err != nil {
		errors = append(errors, fmt.Errorf("cpu: %w", err))
	} else {
		m.CPUUsagePercent = cpuStats.UsagePercent
	}

	memStats, err := CollectMemory()
	if err != nil {
		errors = append(errors, fmt.Errorf("memory: %w", err))
	} else {
		m.MemoryUsagePercent = memStats.UsagePercent
		m.MemoryUsedMB = memStats.UsedMB
		m.MemoryTotalMB = memStats.TotalMB
	}

	diskStats, err := CollectDisk()
	if err != nil {
		errors = append(errors, fmt.Errorf("disk: %w", err))
	} else {
		m.DiskUsagePercent = diskStats.UsagePercent
		m.DiskUsedGB = diskStats.UsedGB
		m.DiskTotalGB = diskStats.TotalGB
	}

	netStats, err := CollectNetwork()
	if err != nil {
		errors = append(errors, fmt.Errorf("network: %w", err))
	} else {
		m.NetworkBytesSent = float64(netStats.BytesSent)
		m.NetworkBytesRecv = float64(netStats.BytesRecv)
	}

	return m, errors
}

func getOSInfo() string {
	data, err := os.ReadFile("/etc/os-release")
	if err != nil {
		return "Linux"
	}

	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "PRETTY_NAME=") {
			name := strings.TrimPrefix(line, "PRETTY_NAME=")
			name = strings.Trim(name, "\"")
			return name
		}
	}
	return "Linux"
}
