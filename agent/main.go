package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Grand840/veltrix-app/agent/collector"
	"github.com/Grand840/veltrix-app/agent/sender"
)

const version = "0.1.0"

func main() {
	log.Printf("=== Veltrix Agent v%s ===", version)

	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("[FATAL] Configuration invalide: %v", err)
	}

	log.Printf("[INFO] API URL   : %s", cfg.APIURL)
	log.Printf("[INFO] Intervalle: %s", cfg.Interval)
	log.Printf("[INFO] Buffer dir: %s", cfg.BufferDir)

	s, err := sender.NewSender(
		cfg.APIURL,
		cfg.APIKey,
		cfg.HTTPTimeout,
		cfg.BufferDir,
		cfg.MaxBufferSize,
	)
	if err != nil {
		log.Fatalf("[FATAL] Impossible d'initialiser le sender: %v", err)
	}

	log.Printf("[INFO] Agent démarré — envoi toutes les %s", cfg.Interval)

	runCycle(s)

	ticker := time.NewTicker(cfg.Interval)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			runCycle(s)

		case sig := <-sigChan:
			log.Printf("[INFO] Signal reçu: %v — arrêt propre en cours...", sig)
			ticker.Stop()
			log.Printf("[INFO] Agent arrêté proprement.")
			os.Exit(0)
		}
	}
}

func runCycle(s *sender.Sender) {
	metrics, errs := collector.Collect()
	if len(errs) > 0 {
		for _, e := range errs {
			log.Printf("[WARN] Collecte partielle: %v", e)
		}
	}

	payload := &sender.MetricPayload{
		Hostname:           metrics.Hostname,
		OSInfo:             metrics.OSInfo,
		CPUUsagePercent:    metrics.CPUUsagePercent,
		MemoryUsagePercent: metrics.MemoryUsagePercent,
		MemoryUsedMB:       metrics.MemoryUsedMB,
		MemoryTotalMB:      metrics.MemoryTotalMB,
		DiskUsagePercent:   metrics.DiskUsagePercent,
		DiskUsedGB:         metrics.DiskUsedGB,
		DiskTotalGB:        metrics.DiskTotalGB,
		NetworkBytesSent:   metrics.NetworkBytesSent,
		NetworkBytesRecv:   metrics.NetworkBytesRecv,
	}

	if err := s.Send(payload); err != nil {
		log.Printf("[WARN] Cycle échoué: %v", err)
	} else {
		log.Printf(
			"[OK] CPU=%.1f%% RAM=%.1f%% Disk=%.1f%%",
			metrics.CPUUsagePercent,
			metrics.MemoryUsagePercent,
			metrics.DiskUsagePercent,
		)
	}
}
