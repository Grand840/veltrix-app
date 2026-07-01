package collector

import (
	"github.com/shirou/gopsutil/v3/net"
)

type NetworkStats struct {
	BytesSent uint64
	BytesRecv uint64
}

func CollectNetwork() (*NetworkStats, error) {
	ioStats, err := net.IOCounters(false)
	if err != nil {
		return nil, err
	}

	if len(ioStats) == 0 {
		return &NetworkStats{}, nil
	}

	return &NetworkStats{
		BytesSent: ioStats[0].BytesSent,
		BytesRecv: ioStats[0].BytesRecv,
	}, nil
}
