#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

APP_NAME="VoidNotes"
APP_PATH="$PROJECT_ROOT/build/bin/voidnotes.app"
DMG_PATH="$PROJECT_ROOT/build/bin/${APP_NAME}.dmg"
TEMP_DMG_PATH="$PROJECT_ROOT/build/bin/${APP_NAME}_temp.dmg"
VOLUME_NAME="${APP_NAME}"
BACKGROUND_FILE="$SCRIPT_DIR/dmg-background.svg"
MOUNT_POINT="/Volumes/$VOLUME_NAME"

if ! command -v rsvg-convert &> /dev/null; then
    echo "Installing librsvg for background image conversion..."
    brew install librsvg
fi

rsvg-convert -h 400 "$BACKGROUND_FILE" > "$SCRIPT_DIR/dmg-background.png"

if [ ! -d "$APP_PATH" ]; then
    echo "Error: $APP_PATH does not exist!"
    exit 1
fi

rm -f "$DMG_PATH"
rm -f "$TEMP_DMG_PATH"

echo "Creating temporary DMG..."
hdiutil create -volname "$VOLUME_NAME" -srcfolder "$APP_PATH" -ov -format UDRW "$TEMP_DMG_PATH"

echo "Mounting temporary DMG..."
hdiutil attach "$TEMP_DMG_PATH" -mountpoint "$MOUNT_POINT"

echo "Creating Applications symlink..."
ln -s /Applications "$MOUNT_POINT/Applications"

mkdir -p "$MOUNT_POINT/.background"
cp "$SCRIPT_DIR/dmg-background.png" "$MOUNT_POINT/.background/background.png"

echo "Setting up DMG appearance..."
osascript << EOT
tell application "Finder"
    tell disk "$VOLUME_NAME"
        open
        set current view of container window to icon view
        set toolbar visible of container window to false
        set statusbar visible of container window to false
        set bounds of container window to {400, 100, 1000, 500}
        set theViewOptions to the icon view options of container window
        set arrangement of theViewOptions to not arranged
        set icon size of theViewOptions to 128
        set background picture of theViewOptions to file ".background:background.png"
        set position of item "$APP_NAME.app" of container window to {160, 170}
        set position of item "Applications" of container window to {440, 170}
        update without registering applications
        delay 2
        close
    end tell
end tell
EOT

echo "Unmounting temporary DMG..."
hdiutil detach "$MOUNT_POINT"

echo "Creating final compressed DMG..."
hdiutil convert "$TEMP_DMG_PATH" -format UDZO -imagekey zlib-level=9 -o "$DMG_PATH"

rm -f "$TEMP_DMG_PATH"
rm -f "$SCRIPT_DIR/dmg-background.png"

if [ -f "$DMG_PATH" ]; then
    echo "DMG created successfully at $DMG_PATH"
    echo "Your professional installer is ready!"
else
    echo "Failed to create DMG"
    exit 1
fi


# Run this command to build the app and create the DMG after you wail build     
# cd /Users/void/docs/GitHub/VoidNotes && ./scripts/create-dmg.sh