package sender

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"
)

type Buffer struct {
	dir           string
	maxBufferSize int
}

type BufferItem struct {
	Path string
	Data []byte
}

func NewBuffer(dir string, maxSize int) (*Buffer, error) {
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("impossible de créer le répertoire buffer %s: %w", dir, err)
	}
	return &Buffer{dir: dir, maxBufferSize: maxSize}, nil
}

func (b *Buffer) Save(payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("sérialisation buffer: %w", err)
	}

	filename := filepath.Join(b.dir, fmt.Sprintf("%d.json", time.Now().UnixNano()))
	if err := os.WriteFile(filename, data, 0644); err != nil {
		return fmt.Errorf("écriture buffer: %w", err)
	}

	b.cleanup()
	return nil
}

func (b *Buffer) LoadAll() ([]BufferItem, error) {
	entries, err := os.ReadDir(b.dir)
	if err != nil {
		return nil, nil
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".json" {
			files = append(files, filepath.Join(b.dir, entry.Name()))
		}
	}
	sort.Strings(files)

	var result []BufferItem
	for _, f := range files {
		data, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		result = append(result, BufferItem{Path: f, Data: data})
	}

	return result, nil
}

func (b *Buffer) Delete(path string) error {
	return os.Remove(path)
}

func (b *Buffer) Size() int {
	entries, err := os.ReadDir(b.dir)
	if err != nil {
		return 0
	}
	count := 0
	for _, e := range entries {
		if !e.IsDir() && filepath.Ext(e.Name()) == ".json" {
			count++
		}
	}
	return count
}

func (b *Buffer) cleanup() {
	entries, err := os.ReadDir(b.dir)
	if err != nil {
		return
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && filepath.Ext(e.Name()) == ".json" {
			files = append(files, filepath.Join(b.dir, e.Name()))
		}
	}

	sort.Strings(files)

	for len(files) > b.maxBufferSize {
		os.Remove(files[0])
		files = files[1:]
	}
}
