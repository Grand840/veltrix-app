package collector

import (
	"time"

	"github.com/shirou/gopsutil/v3/net"
)

type NetworkStats struct {
	BytesSentTotal  uint64
	BytesRecvTotal  uint64
	BytesSentPerSec float64
	BytesRecvPerSec float64
}

var networkState struct {
	lastBytesSent uint64
	lastBytesRecv uint64
	lastTime      time.Time
	initialized   bool
}

func CollectNetwork() (*NetworkStats, error) {
	ioStats, err := net.IOCounters(false)
	if err != nil {
		return nil, err
	}
	if len(ioStats) == 0 {
		return &NetworkStats{}, nil
	}

	now := time.Now()
	currentSent := ioStats[0].BytesSent
	currentRecv := ioStats[0].BytesRecv

	stats := &NetworkStats{
		BytesSentTotal: currentSent,
		BytesRecvTotal: currentRecv,
	}

	if networkState.initialized {
		elapsed := now.Sub(networkState.lastTime).Seconds()
		if elapsed > 0 {
			deltaSent := float64(currentSent - networkState.lastBytesSent)
			deltaRecv := float64(currentRecv - networkState.lastBytesRecv)
			if deltaSent < 0 {
				deltaSent = 0
			}
			if deltaRecv < 0 {
				deltaRecv = 0
			}
			stats.BytesSentPerSec = deltaSent / elapsed
			stats.BytesRecvPerSec = deltaRecv / elapsed
		}
	}

	networkState.lastBytesSent = currentSent
	networkState.lastBytesRecv = currentRecv
	networkState.lastTime = now
	networkState.initialized = true

	return stats, nil
}
