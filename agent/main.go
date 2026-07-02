package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Grand840/veltrix-app/agent/collector"
	"github.com/Grand840/veltrix-app/agent/logger"
	"github.com/Grand840/veltrix-app/agent/sender"
)

func runCycle(log *logger.Logger, snd *sender.Sender) {
	metrics, errs := collector.Collect()

	if len(errs) > 0 {
		for _, e := range errs {
			log.Warn("collect warning", logger.F("field", e.(*collector.CollectError).Field, "error", e.Error()))
		}
	}

	err := snd.Send(metrics)
	if err != nil {
		log.Error("send failed", logger.F("error", err.Error()))
	} else {
		log.Info("metrics sent",
			logger.F(
				"cpu", fmt.Sprintf("%.1f%%", metrics.CPUPct),
				"load", fmt.Sprintf("%.2f", metrics.CPULoad1),
				"mem", fmt.Sprintf("%.1f%%", metrics.MemUsedPct),
				"disk", fmt.Sprintf("%.1f%%", metrics.DiskUsedPct),
				"net_sent_kbps", fmt.Sprintf("%.1f", metrics.NetworkBytesSentPerSec/1024),
				"net_recv_kbps", fmt.Sprintf("%.1f", metrics.NetworkBytesRecvPerSec/1024),
			),
		)
	}
}

func main() {
	apiURL := os.Getenv("VELTRIX_API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8000"
	}
	apiKey := os.Getenv("VELTRIX_API_KEY")
	if apiKey == "" {
		apiKey = "dev-key"
	}

	log := logger.New(logger.INFO)
	snd := sender.New(apiURL, apiKey)

	log.Info("agent starting",
		logger.F("api_url", apiURL, "interval", "15s"),
	)

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	runCycle(log, snd)

	running := true
	for running {
		select {
		case <-ticker.C:
			runCycle(log, snd)
		case sig := <-sigCh:
			log.Info("shutting down", logger.F("signal", sig.String()))
			sent, _ := snd.Flush()
			log.Info("flushed buffer", logger.F("sent", sent))
			running = false
		}
	}
}
