# docker build -t bootstrap-chat . 
# docker run --rm -it -p 8080:8080 bootstrap-chat:latest
FROM golang:latest AS builder
RUN apt-get update
# Install nodejs.
RUN apt-get install curl && \
    curl -sL https://deb.nodesource.com/setup_13.x | bash && \
    apt-get install nodejs
WORKDIR /go/src/bootstrap-chat
# Caching node modules.
COPY package.json .
RUN npm install
COPY ./public ./public
RUN npm run build

# Optional go envs.
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64
# Caching go modules
COPY go.mod .
RUN go mod download
COPY . .
RUN go install

FROM scratch
COPY --from=builder /go/src/bootstrap-chat/public ./public
COPY --from=builder /go/bin/bootstrap-chat .
ENTRYPOINT ["./bootstrap-chat"]