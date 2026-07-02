package collector

import (
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/host"
)

type Metrics struct {
	Hostname               string
	UptimeSeconds          uint64
	CPUPct                 float64
	CPULoad1               float64
	CPULoad5               float64
	CPULoad15              float64
	MemTotalGB             float64
	MemUsedGB              float64
	MemUsedPct             float64
	DiskTotalGB            float64
	DiskUsedGB             float64
	DiskUsedPct            float64
	NetworkBytesSentTotal  uint64
	NetworkBytesRecvTotal  uint64
	NetworkBytesSentPerSec float64
	NetworkBytesRecvPerSec float64
}

type CollectError struct {
	Field string
	Err   error
}

func (e *CollectError) Error() string {
	return e.Field + ": " + e.Err.Error()
}

func Collect() (*Metrics, []error) {
	m := &Metrics{}
	var errs []error

	hostInfo, err := host.Info()
	if err != nil {
		errs = append(errs, &CollectError{Field: "hostname", Err: err})
	} else {
		m.Hostname = hostInfo.Hostname
		m.UptimeSeconds = hostInfo.Uptime
	}

	loadStats, err := load.Avg()
	if err != nil {
		errs = append(errs, &CollectError{Field: "load", Err: err})
	} else {
		m.CPULoad1 = loadStats.Load1
		m.CPULoad5 = loadStats.Load5
		m.CPULoad15 = loadStats.Load15
	}

	cpuPct, err := cpu.Percent(time.Second, false)
	if err != nil {
		errs = append(errs, &CollectError{Field: "cpu_percent", Err: err})
	} else if len(cpuPct) > 0 {
		m.CPUPct = cpuPct[0]
	}

	memStats, err := mem.VirtualMemory()
	if err != nil {
		errs = append(errs, &CollectError{Field: "memory", Err: err})
	} else {
		m.MemTotalGB = float64(memStats.Total) / (1024 * 1024 * 1024)
		m.MemUsedGB = float64(memStats.Used) / (1024 * 1024 * 1024)
		m.MemUsedPct = memStats.UsedPercent
	}

	diskStats, err := disk.Usage("/")
	if err != nil {
		errs = append(errs, &CollectError{Field: "disk", Err: err})
	} else {
		m.DiskTotalGB = float64(diskStats.Total) / (1024 * 1024 * 1024)
		m.DiskUsedGB = float64(diskStats.Used) / (1024 * 1024 * 1024)
		m.DiskUsedPct = diskStats.UsedPercent
	}

	netStats, err := CollectNetwork()
	if err != nil {
		errs = append(errs, &CollectError{Field: "network", Err: err})
	} else {
		m.NetworkBytesSentTotal = netStats.BytesSentTotal
		m.NetworkBytesRecvTotal = netStats.BytesRecvTotal
		m.NetworkBytesSentPerSec = netStats.BytesSentPerSec
		m.NetworkBytesRecvPerSec = netStats.BytesRecvPerSec
	}

	return m, errs
}
