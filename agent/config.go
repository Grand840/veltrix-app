package main

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	APIKey        string
	APIURL        string
	Interval      time.Duration
	BufferDir     string
	MaxBufferSize int
	HTTPTimeout   time.Duration
}

func LoadConfig() (*Config, error) {
	apiKey := os.Getenv("VELTRIX_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf(
			"VELTRIX_KEY est obligatoire.\n" +
			"Exemple : export VELTRIX_KEY=vltx_votre_cle_ici",
		)
	}

	apiURL := os.Getenv("VELTRIX_URL")
	if apiURL == "" {
		apiURL = "https://api.veltrix.io"
	}

	intervalSec := 30
	if v := os.Getenv("VELTRIX_INTERVAL"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 10 {
			intervalSec = n
		}
	}

	bufferDir := os.Getenv("VELTRIX_BUFFER_DIR")
	if bufferDir == "" {
		bufferDir = "/tmp/veltrix-buffer"
	}

	return &Config{
		APIKey:        apiKey,
		APIURL:        apiURL,
		Interval:      time.Duration(intervalSec) * time.Second,
		BufferDir:     bufferDir,
		MaxBufferSize: 2000,
		HTTPTimeout:   10 * time.Second,
	}, nil
}
