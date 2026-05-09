package gdb

import (
	"errors"
	"log"
	"log/slog"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/aceberg/WatchYourLAN/internal/conf"
	"github.com/aceberg/WatchYourLAN/internal/models"
)

var db *gorm.DB
var gormConf *gorm.Config

const (
	connectMaxAttempts = 5
	connectBaseDelay   = 2 * time.Second
)

// Start - open Postgres and migrate the normalized schema.
func Start() error {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             5 * time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)
	gormConf = &gorm.Config{Logger: newLogger}

	if err := Connect(); err != nil {
		return err
	}

	if err := db.AutoMigrate(
		&models.HostEvent{},
		&models.Device{},
		&models.DeviceIdentifier{},
		&models.Network{},
		&models.NetworkAttachment{},
		&models.IPAddress{},
	); err != nil {
		return err
	}

	return nil
}

// Connect - open Postgres with retry/backoff. Returns the last error if all attempts fail.
func Connect() error {
	if conf.AppConfig.PGConnect == "" {
		return errors.New("PG_CONNECT is required (Postgres connection string)")
	}

	var err error
	delay := connectBaseDelay
	for attempt := 1; attempt <= connectMaxAttempts; attempt++ {
		db, err = gorm.Open(postgres.Open(conf.AppConfig.PGConnect), gormConf)
		if err == nil {
			slog.Info("Connected to PostgreSQL")
			return nil
		}
		slog.Warn("PostgreSQL connection failed",
			"attempt", attempt, "max", connectMaxAttempts, "err", err)
		if attempt < connectMaxAttempts {
			time.Sleep(delay)
			delay *= 2
		}
	}
	return err
}

// DB - expose handle for callers that need raw access.
func DB() *gorm.DB { return db }
