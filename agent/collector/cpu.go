package collector

import (
	"github.com/shirou/gopsutil/v3/cpu"
)

type CPUStats struct {
	UsagePercent float64
}

func CollectCPU() (*CPUStats, error) {
	percentages, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}

	usage := 0.0
	if len(percentages) > 0 {
		usage = percentages[0]
	}

	return &CPUStats{
		UsagePercent: usage,
	}, nil
}
