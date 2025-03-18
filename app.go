package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// Note represents a single note
type Note struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	CreatedAt string   `json:"createdAt"`
	UpdatedAt string   `json:"updatedAt"`
	Tags      []string `json:"tags,omitempty"`
}

// App struct
type App struct {
	ctx        context.Context
	notesDir   string
	appDataDir string
	logger     *log.Logger
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize logger
	logFile, err := os.OpenFile(filepath.Join(os.TempDir(), "voidnotes.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		a.logger = log.New(logFile, "", log.LstdFlags)
	} else {
		a.logger = log.New(os.Stderr, "", log.LstdFlags)
		a.logger.Printf("Failed to open log file: %v", err)
	}

	a.logger.Println("App starting up...")

	// Initialize the app data directory
	if err := a.initAppDataDir(); err != nil {
		a.logger.Printf("Failed to initialize app data directory: %v", err)
	} else {
		a.logger.Printf("App data directory initialized: %s", a.appDataDir)
		a.logger.Printf("Notes directory: %s", a.notesDir)
	}
}

// initAppDataDir initializes the application data directory based on platform
func (a *App) initAppDataDir() error {
	var appDataPath string

	if runtime.GOOS == "windows" {
		// On Windows: C:\Users\{username}\AppData\Local\VoidNotes
		appDataPath = os.Getenv("LOCALAPPDATA")
		if appDataPath == "" {
			appDataPath = filepath.Join(os.Getenv("USERPROFILE"), "AppData", "Local")
		}
		a.appDataDir = filepath.Join(appDataPath, "VoidNotes")
	} else if runtime.GOOS == "darwin" {
		// On macOS: ~/Library/Application Support/VoidNotes
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		a.appDataDir = filepath.Join(homeDir, "Library", "Application Support", "VoidNotes")
	} else {
		// Fallback for other platforms
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		a.appDataDir = filepath.Join(homeDir, ".voidnotes")
	}

	// Create the app data directory if it doesn't exist
	if err := os.MkdirAll(a.appDataDir, 0755); err != nil {
		return err
	}

	// Create notes directory
	a.notesDir = filepath.Join(a.appDataDir, "notes")
	if err := os.MkdirAll(a.notesDir, 0755); err != nil {
		return err
	}

	return nil
}

// domReady is called after front-end resources have been loaded
func (a *App) domReady(ctx context.Context) {
	a.logger.Println("DOM ready")
}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	a.logger.Println("Application is closing")
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	a.logger.Println("Application shutting down")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show timee!", name)
}

// GetAppDataDir returns the application data directory path
func (a *App) GetAppDataDir() string {
	return a.appDataDir
}

// GetNotesDir returns the notes directory path
func (a *App) GetNotesDir() string {
	return a.notesDir
}

// SaveNote saves a note to the filesystem
func (a *App) SaveNote(noteData string) error {
	startTime := time.Now()
	if a.logger != nil {
		a.logger.Println("SaveNote called with data length:", len(noteData))
	}

	var note Note
	if err := json.Unmarshal([]byte(noteData), &note); err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to unmarshal note: %v", err)
		}
		return fmt.Errorf("failed to unmarshal note: %w", err)
	}

	// Create filename from note ID
	filename := filepath.Join(a.notesDir, note.ID+".json")

	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to create directory for note: %v", err)
		}
		return fmt.Errorf("failed to create directory: %w", err)
	}

	if a.logger != nil {
		a.logger.Printf("Saving note ID: %s, Title: %s, Content length: %d",
			note.ID, note.Title, len(note.Content))
		a.logger.Printf("Writing to file: %s", filename)
	}

	// First write to a temporary file
	tempFilename := filename + ".tmp"
	if err := os.WriteFile(tempFilename, []byte(noteData), 0644); err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to write temporary note file: %v", err)
		}
		return fmt.Errorf("failed to write temporary note file: %w", err)
	}

	// Verify the data was written correctly
	data, err := os.ReadFile(tempFilename)
	if err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to read back temporary file: %v", err)
		}
		return fmt.Errorf("failed to verify temporary file: %w", err)
	}

	if len(data) != len(noteData) {
		if a.logger != nil {
			a.logger.Printf("Verification failed: file size mismatch. Expected %d, got %d",
				len(noteData), len(data))
		}
		return fmt.Errorf("file size mismatch after writing")
	}

	// Now rename the temporary file to the final name (atomic operation)
	if err := os.Rename(tempFilename, filename); err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to rename temporary file: %v", err)
		}
		return fmt.Errorf("failed to finalize note file: %w", err)
	}

	if a.logger != nil {
		a.logger.Printf("Note saved successfully. ID: %s, Time taken: %v",
			note.ID, time.Since(startTime))
	}

	// Double-check that the file exists and has the correct size
	fi, err := os.Stat(filename)
	if err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to stat the saved file: %v", err)
		}
		return fmt.Errorf("saved file cannot be accessed: %w", err)
	}

	if fi.Size() != int64(len(noteData)) {
		if a.logger != nil {
			a.logger.Printf("Final verification failed: file size mismatch. Expected %d, got %d",
				len(noteData), fi.Size())
		}
		return fmt.Errorf("final file size mismatch")
	}

	return nil
}

// LoadNotes loads all notes from the filesystem
func (a *App) LoadNotes() (string, error) {
	startTime := time.Now()
	if a.logger != nil {
		a.logger.Println("LoadNotes called")
	}

	// Read all files in notes directory
	files, err := os.ReadDir(a.notesDir)
	if err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to read notes directory: %v", err)
		}
		return "", fmt.Errorf("failed to read notes directory: %w", err)
	}

	notes := []Note{}

	if a.logger != nil {
		a.logger.Printf("Found %d files in notes directory", len(files))
	}

	for _, file := range files {
		if file.IsDir() || filepath.Ext(file.Name()) != ".json" {
			continue
		}

		filepath := filepath.Join(a.notesDir, file.Name())

		// Read file content
		content, err := os.ReadFile(filepath)
		if err != nil {
			if a.logger != nil {
				a.logger.Printf("Failed to read file %s: %v", file.Name(), err)
			}
			continue
		}

		var note Note
		if err := json.Unmarshal(content, &note); err != nil {
			if a.logger != nil {
				a.logger.Printf("Failed to parse note file %s: %v", file.Name(), err)
			}
			continue
		}

		if a.logger != nil {
			a.logger.Printf("Loaded note ID: %s, Title: %s", note.ID, note.Title)
		}

		notes = append(notes, note)
	}

	// Convert notes to JSON
	notesJSON, err := json.Marshal(notes)
	if err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to marshal notes: %v", err)
		}
		return "", fmt.Errorf("failed to marshal notes: %w", err)
	}

	if a.logger != nil {
		a.logger.Printf("Loaded %d notes. Time taken: %v", len(notes), time.Since(startTime))
	}

	return string(notesJSON), nil
}

// DeleteNote deletes a note from the filesystem
func (a *App) DeleteNote(noteID string) error {
	if a.logger != nil {
		a.logger.Printf("DeleteNote called for ID: %s", noteID)
	}

	filename := filepath.Join(a.notesDir, noteID+".json")

	if err := os.Remove(filename); err != nil {
		if a.logger != nil {
			a.logger.Printf("Failed to delete note %s: %v", noteID, err)
		}
		return fmt.Errorf("failed to delete note: %w", err)
	}

	if a.logger != nil {
		a.logger.Printf("Note %s deleted successfully", noteID)
	}

	return nil
}
