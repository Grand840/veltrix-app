package collector

import (
	"github.com/shirou/gopsutil/v3/mem"
)

type MemoryStats struct {
	UsagePercent float64
	UsedMB       float64
	TotalMB      float64
}

func CollectMemory() (*MemoryStats, error) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	return &MemoryStats{
		UsagePercent: vmStat.UsedPercent,
		UsedMB:       float64(vmStat.Used) / 1024 / 1024,
		TotalMB:      float64(vmStat.Total) / 1024 / 1024,
	}, nil
}
