# Frontend build
FROM --platform=$BUILDPLATFORM node:alpine AS frontend

WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Go backend build (cross-compile via buildx-injected GOOS/GOARCH; CGO disabled)
FROM --platform=$BUILDPLATFORM golang:alpine AS builder

WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

# Replace embedded frontend assets with the freshly built bundle.
# Templates load `/fs/public/assets/*`, so copy asset contents into `public/assets/`.
RUN rm -rf internal/web/public/assets/*
COPY --from=frontend /src/dist/assets/. internal/web/public/assets/

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH GOARM=${TARGETVARIANT#v} \
    go build -ldflags='-w -s' -o /WatchYourLAN ./cmd/WatchYourLAN


FROM alpine

WORKDIR /app

RUN apk add --no-cache arp-scan tzdata \
    && mkdir /data

COPY --from=builder /WatchYourLAN /app/

ENTRYPOINT ["./WatchYourLAN"]
