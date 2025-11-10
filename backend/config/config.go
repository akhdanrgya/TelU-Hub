package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type configStruct struct {
	AppPort           string
	DBHost            string
	DBPort            string
	DBUser            string
	DBPassword        string
	DBName            string
	DBSSLMode         string
	JWTSecret         string
	MidtransServerKey string
	MidtransClientKey string
}

var Config *configStruct

func LoadConfig() error {

	err := godotenv.Load()
	if err != nil {
		fmt.Println("Perhatian: file .env tidak ditemukan, lanjut membaca dari Environment...")
	}

	appPort := os.Getenv("APP_PORT")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")
	jwtSecret := os.Getenv("JWT_SECRET")
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	clientKey := os.Getenv("MIDTRANS_CLIENT_KEY")

	if appPort == "" {
		appPort = ":8080"
		fmt.Println("Perhatian: APP_PORT tidak diset, pake default :8080")
	}

	if dbHost == "" {
		return fmt.Errorf("ERROR: DB_HOST tidak diset di environment")
	}
	if dbPort == "" {
		return fmt.Errorf("ERROR: DB_PORT tidak diset di environment")
	}
	if dbUser == "" {
		return fmt.Errorf("ERROR: DB_USER tidak diset di environment")
	}
	if dbName == "" {
		return fmt.Errorf("ERROR: DB_NAME tidak diset di environment")
	}

	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	if jwtSecret == "" {
		return fmt.Errorf("ERROR: JWT_SECRET tidak diset di environment")
	}

	Config = &configStruct{
		AppPort:           appPort,
		DBHost:            dbHost,
		DBPort:            dbPort,
		DBUser:            dbUser,
		DBPassword:        dbPass,
		DBName:            dbName,
		DBSSLMode:         dbSSLMode,
		JWTSecret:         jwtSecret,
		MidtransServerKey: serverKey,
		MidtransClientKey: clientKey,
	}

	return nil
}

func GetAppPort() string {
	if Config == nil {
		log.Fatal("Config belom di-load!")
	}
	return Config.AppPort
}

func GetJWTSecret() string {
	if Config == nil {
		log.Fatal("Config belom di-load!")
	}
	return Config.JWTSecret
}

func GetDBConnectionString() string {
	if Config == nil {
		log.Fatal("Config belom di-load!")
	}
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		Config.DBHost,
		Config.DBUser,
		Config.DBPassword,
		Config.DBName,
		Config.DBPort,
		Config.DBSSLMode,
	)
}

func GetMidtransServerKey() string {
    if Config == nil { log.Fatal() }
    return Config.MidtransServerKey
}
func GetMidtransClientKey() string {
    if Config == nil { log.Fatal() }
    return Config.MidtransClientKey
}
