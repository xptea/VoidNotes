FROM golang:1.24-bullseye

WORKDIR /usr/src/app

# Install base build tools
RUN apt-get update && apt-get install -y --fix-missing \
    build-essential \
    unzip \
    curl

# Install GTK and WebKit for AMD64
RUN apt-get install -y --fix-missing \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev

# Install additional dependencies for AMD64
RUN apt-get install -y --fix-missing \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libharfbuzz0b \
    libatk1.0-0 \
    libcairo2 \
    libcairo-gobject2 \
    libgdk-pixbuf-2.0-0 \
    libsoup2.4-1 \
    libglib2.0-0 \
    libglib2.0-dev \
    libjavascriptcoregtk-4.0-18

# Install X11 libraries
RUN apt-get install -y --fix-missing \
    x11proto-dev \
    libx11-dev \
    libxrender-dev \
    libxext-dev

# Clear cache
RUN rm -rf /var/lib/apt/lists/*

# Install required tooling
RUN go install github.com/wailsapp/wails/v2/cmd/wails@latest
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# Copy project files
COPY . .

# Install frontend dependencies
WORKDIR /usr/src/app/frontend
RUN bun install
WORKDIR /usr/src/app

# Build for Linux AMD64
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 wails build -platform linux/amd64

FROM scratch AS extract
COPY --from=0 /usr/src/app/build/bin/ /


# run this build it.    docker build --target extract --output type=local,dest=./build/bin . 