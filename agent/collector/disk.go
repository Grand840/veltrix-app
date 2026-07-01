package collector

import (
	"github.com/shirou/gopsutil/v3/disk"
)

type DiskStats struct {
	UsagePercent float64
	UsedGB       float64
	TotalGB      float64
}

func CollectDisk() (*DiskStats, error) {
	usage, err := disk.Usage("/")
	if err != nil {
		return nil, err
	}

	return &DiskStats{
		UsagePercent: usage.UsedPercent,
		UsedGB:       float64(usage.Used) / 1024 / 1024 / 1024,
		TotalGB:      float64(usage.Total) / 1024 / 1024 / 1024,
	}, nil
}
