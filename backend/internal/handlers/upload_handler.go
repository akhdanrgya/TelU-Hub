package handlers

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) UploadImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Gagal mengambil file gambar", "details": err.Error()})
	}

	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}
	if !allowedTypes[file.Header.Get("Content-Type")] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Tipe file tidak didukung. Hanya JPEG, PNG, GIF."})
	}

	ext := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), strings.TrimSuffix(file.Filename, ext), ext)
	
	fileName = strings.ReplaceAll(fileName, " ", "-") 
	fileName = strings.ToLower(fileName)

	uploadDir := "./uploads"
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan file gambar", "details": err.Error()})
	}

	imageURL := fmt.Sprintf("%s/uploads/%s", c.BaseURL(), fileName)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Gambar berhasil diupload", "imageUrl": imageURL})
}