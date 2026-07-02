package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type Level string

const (
	DEBUG Level = "DEBUG"
	INFO  Level = "INFO"
	WARN  Level = "WARN"
	ERROR Level = "ERROR"
	FATAL Level = "FATAL"
)

type Logger struct {
	minLevel Level
}

var levelOrder = map[Level]int{
	DEBUG: 0,
	INFO:  1,
	WARN:  2,
	ERROR: 3,
	FATAL: 4,
}

func New(minLevel Level) *Logger {
	return &Logger{minLevel: minLevel}
}

func (l *Logger) log(level Level, msg string, fields map[string]interface{}) {
	if levelOrder[level] < levelOrder[l.minLevel] {
		return
	}
	entry := map[string]interface{}{
		"time":  time.Now().UTC().Format(time.RFC3339),
		"level": level,
		"msg":   msg,
	}
	for k, v := range fields {
		entry[k] = v
	}
	data, err := json.Marshal(entry)
	if err != nil {
		fmt.Fprintf(os.Stderr, "logger error: %v\n", err)
		return
	}
	fmt.Println(string(data))
	if level == FATAL {
		os.Exit(1)
	}
}

func (l *Logger) Info(msg string, fields ...map[string]interface{}) {
	l.log(INFO, msg, merge(fields...))
}
func (l *Logger) Warn(msg string, fields ...map[string]interface{}) {
	l.log(WARN, msg, merge(fields...))
}
func (l *Logger) Error(msg string, fields ...map[string]interface{}) {
	l.log(ERROR, msg, merge(fields...))
}
func (l *Logger) Fatal(msg string, fields ...map[string]interface{}) {
	l.log(FATAL, msg, merge(fields...))
}
func (l *Logger) Debug(msg string, fields ...map[string]interface{}) {
	l.log(DEBUG, msg, merge(fields...))
}

func F(keysAndValues ...interface{}) map[string]interface{} {
	m := make(map[string]interface{})
	for i := 0; i+1 < len(keysAndValues); i += 2 {
		if key, ok := keysAndValues[i].(string); ok {
			m[key] = keysAndValues[i+1]
		}
	}
	return m
}

func merge(maps ...map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for _, m := range maps {
		for k, v := range m {
			result[k] = v
		}
	}
	return result
}
