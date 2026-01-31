# SignaLife - Docker Deployment

This directory contains the Docker configuration files for deploying the SignaLife Next.js application.

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Build and Run with Docker

```bash
# Build the image
docker build -t signa-life .

# Run the container
docker run -p 3000:3000 signa-life
```

## Docker Configuration

### Files

- **Dockerfile**: Multi-stage production-ready Dockerfile optimized for Next.js applications
- **.dockerignore**: Excludes unnecessary files from the Docker build context
- **docker-compose.yml**: Docker Compose configuration for easy deployment

### Features

- **Multi-stage build**: Optimized for production with separate build and runtime stages
- **Security**: Runs as non-root user with proper permissions
- **Performance**: Uses Alpine Linux for smaller image size
- **Health checks**: Built-in health monitoring
- **Production ready**: Configured for production deployment

### Environment Variables

- `NODE_ENV=production`: Sets Node.js to production mode
- `PORT=3000`: Application port
- `HOSTNAME=0.0.0.0`: Binds to all network interfaces

### Ports

- **3000**: Application HTTP port

## Build Process

The Dockerfile uses a multi-stage approach:

1. **deps stage**: Installs only production dependencies
2. **builder stage**: Builds the Next.js application
3. **runner stage**: Creates the final production image

This approach results in:
- Smaller final image size
- Faster build times
- Better security (no build tools in final image)
- Optimized for production deployment

## Monitoring

The container includes health checks that verify the application is responding on port 3000. Use `docker-compose ps` to check the health status.

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port mapping in docker-compose.yml
2. **Build failures**: Check package.json dependencies and Node.js version compatibility
3. **Permission errors**: The container runs as user `nextjs` (UID 1001)

### Logs

```bash
# View application logs
docker-compose logs signa-life

# Follow logs in real-time
docker-compose logs -f signa-life
```

## Production Deployment

For production environments:

1. Use a reverse proxy (nginx, traefik) in front of the container
2. Configure SSL/TLS certificates
3. Set up proper logging and monitoring
4. Use external databases and storage
5. Configure environment-specific variables

## Security Notes

- The container runs as a non-root user
- Only necessary files are included in the final image
- Production dependencies only are installed
- Health checks monitor application availability