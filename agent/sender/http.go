package sender

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type MetricPayload struct {
	Hostname           string  `json:"hostname"`
	OSInfo             string  `json:"os_info,omitempty"`
	IPAddress          string  `json:"ip_address,omitempty"`
	CPUUsagePercent    float64 `json:"cpu_usage_percent"`
	MemoryUsagePercent float64 `json:"memory_usage_percent"`
	MemoryUsedMB       float64 `json:"memory_used_mb"`
	MemoryTotalMB      float64 `json:"memory_total_mb"`
	DiskUsagePercent   float64 `json:"disk_usage_percent"`
	DiskUsedGB         float64 `json:"disk_used_gb"`
	DiskTotalGB        float64 `json:"disk_total_gb"`
	NetworkBytesSent   float64 `json:"network_bytes_sent"`
	NetworkBytesRecv   float64 `json:"network_bytes_recv"`
}

type Sender struct {
	apiURL string
	apiKey string
	client *http.Client
	buffer *Buffer
}

func NewSender(apiURL, apiKey string, timeout time.Duration, bufferDir string, maxBuf int) (*Sender, error) {
	buf, err := NewBuffer(bufferDir, maxBuf)
	if err != nil {
		return nil, err
	}

	return &Sender{
		apiURL: apiURL,
		apiKey: apiKey,
		client: &http.Client{Timeout: timeout},
		buffer: buf,
	}, nil
}

func (s *Sender) Send(payload *MetricPayload) error {
	s.flushBuffer()

	if err := s.sendHTTP(payload); err != nil {
		log.Printf("[WARN] Envoi échoué, mise en buffer: %v", err)
		if bufErr := s.buffer.Save(payload); bufErr != nil {
			log.Printf("[ERROR] Impossible de bufferiser: %v", bufErr)
		} else {
			log.Printf("[INFO] Payload bufferisé (%d en attente)", s.buffer.Size())
		}
		return err
	}

	return nil
}

func (s *Sender) sendHTTP(payload *MetricPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("sérialisation: %w", err)
	}

	req, err := http.NewRequest("POST",
		s.apiURL+"/api/v1/metrics/ingest",
		bytes.NewBuffer(data),
	)
	if err != nil {
		return fmt.Errorf("création requête: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Agent-Key", s.apiKey)
	req.Header.Set("User-Agent", "veltrix-agent/0.1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("réseau: %w", err)
	}
	defer resp.Body.Close()

	io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API retourne HTTP %d", resp.StatusCode)
	}

	return nil
}

func (s *Sender) flushBuffer() {
	pending, err := s.buffer.LoadAll()
	if err != nil || len(pending) == 0 {
		return
	}

	log.Printf("[INFO] Vidage du buffer: %d payload(s) en attente", len(pending))

	for _, item := range pending {
		var payload MetricPayload
		if err := json.Unmarshal(item.Data, &payload); err != nil {
			s.buffer.Delete(item.Path)
			continue
		}

		if err := s.sendHTTP(&payload); err != nil {
			log.Printf("[WARN] Buffer flush échoué: %v — arrêt du vidage", err)
			return
		}

		s.buffer.Delete(item.Path)
		log.Printf("[INFO] Payload bufferisé envoyé et supprimé")
	}
}
