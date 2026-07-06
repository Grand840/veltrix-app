package sender

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Grand840/veltrix-app/agent/collector"
)

type MetricPayload struct {
	ApiKey                 string  `json:"api_key"`
	Hostname               string  `json:"hostname"`
	OSInfo                 string  `json:"os_info"`
	IPAddress              string  `json:"ip_address"`
	UptimeSeconds          uint64  `json:"uptime_seconds"`
	CPUPct                 float64 `json:"cpu_pct"`
	CPULoad1               float64 `json:"cpu_load_1"`
	CPULoad5               float64 `json:"cpu_load_5"`
	CPULoad15              float64 `json:"cpu_load_15"`
	MemTotalGB             float64 `json:"mem_total_gb"`
	MemUsedGB              float64 `json:"mem_used_gb"`
	MemUsedPct             float64 `json:"mem_used_pct"`
	DiskTotalGB            float64 `json:"disk_total_gb"`
	DiskUsedGB             float64 `json:"disk_used_gb"`
	DiskUsedPct            float64 `json:"disk_used_pct"`
	NetworkBytesSent       uint64  `json:"network_bytes_sent"`
	NetworkBytesRecv       uint64  `json:"network_bytes_recv"`
	NetworkBytesSentPerSec float64 `json:"network_bytes_sent_per_sec"`
	NetworkBytesRecvPerSec float64 `json:"network_bytes_recv_per_sec"`
}

type Sender struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
	buffer     [][]byte
}

func New(baseURL, apiKey string) *Sender {
	return &Sender{
		baseURL:    baseURL,
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 10 * time.Second},
		buffer:     make([][]byte, 0),
	}
}

func (s *Sender) sendRequest(payload []byte) error {
	url := s.baseURL + "/api/v1/metrics/ingest"
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Agent-Key", s.apiKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	return nil
}

func (s *Sender) Send(metrics *collector.Metrics) error {
	payload := MetricPayload{
		ApiKey:                 s.apiKey,
		Hostname:               metrics.Hostname,
		OSInfo:                 metrics.OSInfo,
		IPAddress:              metrics.IPAddress,
		UptimeSeconds:          metrics.UptimeSeconds,
		CPUPct:                 metrics.CPUPct,
		CPULoad1:               metrics.CPULoad1,
		CPULoad5:               metrics.CPULoad5,
		CPULoad15:              metrics.CPULoad15,
		MemTotalGB:             metrics.MemTotalGB,
		MemUsedGB:              metrics.MemUsedGB,
		MemUsedPct:             metrics.MemUsedPct,
		DiskTotalGB:            metrics.DiskTotalGB,
		DiskUsedGB:             metrics.DiskUsedGB,
		DiskUsedPct:            metrics.DiskUsedPct,
		NetworkBytesSent:       metrics.NetworkBytesSentTotal,
		NetworkBytesRecv:       metrics.NetworkBytesRecvTotal,
		NetworkBytesSentPerSec: metrics.NetworkBytesSentPerSec,
		NetworkBytesRecvPerSec: metrics.NetworkBytesRecvPerSec,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	delays := []time.Duration{1 * time.Second, 2 * time.Second, 4 * time.Second}

	for attempt := 0; attempt < 4; attempt++ {
		err = s.sendRequest(data)
		if err == nil {
			return nil
		}
		if attempt < 3 {
			time.Sleep(delays[attempt])
		}
	}

	s.buffer = append(s.buffer, data)
	if len(s.buffer) > 100 {
		s.buffer = s.buffer[len(s.buffer)-100:]
	}
	return fmt.Errorf("after 3 retries (%d queued): %w", len(s.buffer), err)
}

func (s *Sender) Flush() (int, error) {
	sent := 0
	var lastErr error
	for _, data := range s.buffer {
		err := s.sendRequest(data)
		if err != nil {
			lastErr = err
			continue
		}
		sent++
	}
	if sent > 0 {
		s.buffer = make([][]byte, 0)
	}
	return sent, lastErr
}

func (s *Sender) BufferSize() int {
	return len(s.buffer)
}
