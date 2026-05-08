FROM --platform=$BUILDPLATFORM tonistiigi/xx AS xx

# Frontend build
FROM --platform=$BUILDPLATFORM node:alpine AS frontend

WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Go backend build
FROM --platform=$BUILDPLATFORM golang:alpine AS builder

COPY --from=xx / /

WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

# Replace embedded frontend assets with the freshly built bundle.
# Templates load `/fs/public/assets/*`, so copy asset contents into `public/assets/`.
RUN rm -rf internal/web/public/assets/*
COPY --from=frontend /src/dist/assets/. internal/web/public/assets/

ARG TARGETPLATFORM
RUN CGO_ENABLED=0 xx-go build -ldflags='-w -s' -o /WatchYourLAN ./cmd/WatchYourLAN


FROM alpine

WORKDIR /app

RUN apk add --no-cache arp-scan tzdata \
    && mkdir /data

COPY --from=builder /WatchYourLAN /app/

ENTRYPOINT ["./WatchYourLAN"]
