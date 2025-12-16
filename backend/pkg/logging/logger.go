package logging

import (
	"os"

	"github.com/sirupsen/logrus"
)

// Logger represents the application logger
type Logger struct {
	*logrus.Logger
}

// NewLogger creates a new logger instance
func NewLogger() *Logger {
	log := logrus.New()

	// Set log level
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}

	level, err := logrus.ParseLevel(logLevel)
	if err != nil {
		level = logrus.InfoLevel
	}
	log.SetLevel(level)

	// Set formatter
	log.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})

	// Set output
	log.SetOutput(os.Stdout)

	return &Logger{Logger: log}
}

// WithFields adds fields to log entry
func (l *Logger) WithFields(fields logrus.Fields) *logrus.Entry {
	return l.Logger.WithFields(fields)
}

// WithError adds error to log entry
func (l *Logger) WithError(err error) *logrus.Entry {
	return l.Logger.WithError(err)
}

// WithField adds single field to log entry
func (l *Logger) WithField(key string, value interface{}) *logrus.Entry {
	return l.Logger.WithField(key, value)
}