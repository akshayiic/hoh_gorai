# Installation and Setup Guide

Complete guide to install and configure the Figma Desktop Bridge system.

## System Requirements

- **Operating System:** macOS, Windows, or Linux
- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 9.0.0 or higher
- **Figma:** Desktop application (latest version)
- **AI Agent:** Claude Code or any MCP-compatible agent

## Step 1: Verify Prerequisites

### Check Node.js and npm versions

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

### Verify Figma Desktop

Make sure you have Figma Desktop installed and can open it.

```bash
# On macOS
open -a Figma

# On Windows
start Figma

# On Linux
figma
```

## Step 2: Clone and Install

### Clone the repository

```bash
git clone https://github.com/yourusername/figma-bridge.git
cd figma-bridge
```

### Install dependencies

```bash
npm install
```

This will install dependencies for all three packages:
- `@figma-bridge/shared` - Shared types
- `@figma-bridge/plugin` - Figma plugin
- `@figma-bridge/server` - MCP server

## Step 3: Build the Project

### Build all components

```bash
npm run build
```

This compiles TypeScript files and creates:
- `shared/dist/` - Shared JavaScript modules
- `plugin/dist/` - Figma plugin code
- `server/dist/` - MCP server code

### Verify build

```bash
# Check if all dist directories exist
ls shared/dist/
ls plugin/dist/
ls server/dist/
```

## Step 4: Package and Install Figma Plugin

### Package the plugin

```bash
npm run package
```

This creates `figma-bridge-plugin/` directory with:
- `manifest.json` - Plugin configuration
- `dist/code.js` - Plugin code
- `dist/ui.html` - Plugin UI

### Install in Figma Desktop

1. Open Figma Desktop
2. Go to **Plugins > Development > Import plugin from manifest**
3. Navigate to the `figma-bridge-plugin/` directory
4. Select `manifest.json`
5. Click **Open**

### Verify plugin installation

1. Open any Figma file
2. Press `Cmd+/` (Mac) or `Ctrl+/` (Windows)
3. Search for "Figma Desktop Bridge"
4. You should see it in the plugin list

## Step 5: Start the MCP Server

### Start the server

```bash
npm run dev
```

You should see:
```
Figma Bridge MCP Server starting on ws://localhost:9223
Waiting for Figma plugin to connect...
```

### Test server connection

Leave the server running and open a new terminal:

```bash
# Test if port 9223 is accessible
curl -i http://localhost:9223
```

You should get a connection response (even if it's an error - that means the port is accessible).

## Step 6: Connect Plugin to Server

### Run the plugin

1. Open a Figma file in Figma Desktop
2. Press `Cmd+/` or `Ctrl+/`
3. Select "Figma Desktop Bridge"
4. The plugin UI should appear

### Verify connection

In the plugin UI, you should see:
- Status: "Connected" (green)
- Connection: ws://localhost:9223
- Status text: "Bridge active"

In your terminal where the server is running:
```
Figma plugin connected
```

### Troubleshooting connection issues

If the plugin shows "Disconnected":

1. **Check server is running**
   ```bash
   npm run dev
   ```

2. **Check port availability**
   ```bash
   # On macOS/Linux
   lsof -i :9223

   # On Windows
   netstat -ano | findstr :9223
   ```

3. **Restart the plugin**
   - Close plugin window
   - Re-open from Plugins menu

4. **Check firewall/antivirus**
   - Ensure localhost connections are allowed
   - Port 9223 should be accessible

## Step 7: Configure AI Agent

### Claude Code Configuration

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": [
        "/absolute/path/to/figma-bridge/server/dist/index.js"
      ]
    }
  }
}
```

### Get the absolute path

```bash
# On macOS/Linux
pwd
# Output: /Users/username/figma-bridge

# On Windows
cd
# Output: C:\Users\username\figma-bridge
```

Use the full path in your configuration:

**macOS/Linux:**
```json
{
  "args": ["/Users/username/figma-bridge/server/dist/index.js"]
}
```

**Windows:**
```json
{
  "args": ["C:\\Users\\username\\figma-bridge\\server\\dist/index.js"]
}
```

### Restart Claude Code

After updating configuration, restart Claude Code to load the MCP server.

## Step 8: Test the Integration

### Test with Claude Code

1. Open Claude Code
2. Try this prompt:

```
List all frames in my current Figma page
```

You should see a list of frames from your currently open Figma file.

### Create a test frame

Try this prompt:

```
Create a test frame with width 400 and height 300
```

The frame should appear in your Figma document.

## Common Installation Issues

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Port 9223 already in use

**Solution:**
```bash
# Find process using the port
lsof -i :9223  # macOS/Linux
netstat -ano | findstr :9223  # Windows

# Kill the process or change the port in server/src/index.ts
```

### Issue: Plugin not connecting to server

**Solution:**
1. Verify server is running
2. Check firewall settings
3. Ensure both are on localhost
4. Try restarting both

### Issue: Agent can't access MCP server

**Solution:**
1. Verify absolute path in configuration
2. Check file permissions
3. Restart Claude Code
4. Check server is in PATH or use absolute node path

## Development Setup

For development, you can run components in watch mode:

```bash
# Terminal 1: Watch plugin and server
npm run dev

# Terminal 2: Watch shared types (if editing)
cd shared && npm run dev
```

## Production Deployment

For production use:

```bash
# Build for production
npm run build

# Package plugin
npm run package

# Start server (use process manager like PM2)
npm run start
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server/dist/index.js --name figma-bridge

# Configure to start on system boot
pm2 startup
pm2 save
```

## Verification Checklist

Before proceeding to use the system, verify:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Project built (`npm run build`)
- [ ] Plugin packaged (`npm run package`)
- [ ] Plugin installed in Figma Desktop
- [ ] MCP server running (`npm run dev`)
- [ ] Plugin shows "Connected" status
- [ ] Server console shows "Figma plugin connected"
- [ ] AI agent configured with MCP server path
- [ ] Agent can list frames from Figma

## Next Steps

Once installation is complete:

1. Read the [Quick Start Guide](QUICKSTART.md)
2. Check out the [API Documentation](API.md)
3. Try [Example Workflows](EXAMPLES.md)
4. Start building with Figma!

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in server terminal
3. Check Figma plugin console (Cmd+Option+I on Mac)
4. Open an issue on GitHub with:
   - Your operating system
   - Node.js and npm versions
   - Error messages and logs
   - Steps to reproduce the issue
