#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
APP_NAME="VoidNotes"
APP_PATH="$PROJECT_ROOT/build/bin/voidnotes.app"
PKG_PATH="$PROJECT_ROOT/build/bin/${APP_NAME}_installer.pkg"

# Post-install script creation
POSTINSTALL_SCRIPT="$SCRIPT_DIR/postinstall"
cat << EOF > "$POSTINSTALL_SCRIPT"
#!/bin/bash

# Sleep for a moment to ensure the package installation is complete
sleep 1

# Define paths
APP_NAME="VoidNotes"
TEMP_APP_PATH="/private/tmp/$APP_NAME.app"
FINAL_APP_PATH="/Applications/$APP_NAME.app"

# Remove existing app if it exists
rm -rf "\$FINAL_APP_PATH"

# Move the app to Applications folder
mv "\$TEMP_APP_PATH" "\$FINAL_APP_PATH"

# Fix permissions and signing
chown -R \$USER:staff "\$FINAL_APP_PATH"
chmod -R 755 "\$FINAL_APP_PATH"
xattr -cr "\$FINAL_APP_PATH"
codesign --force --deep --sign - "\$FINAL_APP_PATH"

# Open the app
open "\$FINAL_APP_PATH"

exit 0
EOF

chmod +x "$POSTINSTALL_SCRIPT"

# Build the .pkg
mkdir -p "$SCRIPT_DIR/scripts"
cp "$POSTINSTALL_SCRIPT" "$SCRIPT_DIR/scripts/postinstall"

pkgbuild --root "$APP_PATH" \
         --identifier com.void.voidnotes \
         --version 1.0 \
         --install-location "/private/tmp/$APP_NAME.app" \
         --scripts "$SCRIPT_DIR/scripts" \
         "$PKG_PATH"

if [ -f "$PKG_PATH" ]; then
    echo "Installer package created successfully at $PKG_PATH"
    echo "Users can now install by running the .pkg file."
else
    echo "Failed to create installer package"
    exit 1
fi

# Run this command to build the app and create the PKG after you wail build
# cd /Users/void/docs/GitHub/VoidNotes && ./scripts/create-pkg.sh
