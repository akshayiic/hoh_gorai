# Quick Start Guide

Get up and running with Figma Desktop Bridge in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build Everything

```bash
npm run build
```

## Step 3: Package and Install Plugin

```bash
npm run package
```

Then in Figma Desktop:
1. Go to **Plugins > Development > Import plugin from manifest**
2. Navigate to `figma-bridge-plugin/manifest.json`
3. Click **Import**

## Step 4: Start the MCP Server

```bash
npm run dev
```

You should see:
```
Figma Bridge MCP Server starting on ws://localhost:9223
Waiting for Figma plugin to connect...
```

## Step 5: Run the Plugin in Figma

1. Open any Figma file
2. Press **Cmd+/ ** (Mac) or **Ctrl+/** (Windows)
3. Search for "Figma Desktop Bridge"
4. Click to run

You should see the plugin UI show "Connected" status.

## Step 6: Configure Your AI Agent

Add to your agent's MCP configuration:

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/absolute/path/to/figma-bridge/server/dist/index.js"]
    }
  }
}
```

## Step 7: Test with Your Agent

Try these prompts:

- "List all frames in my current Figma page"
- "Create a new frame called 'Hero Section' with width 1200 and height 600"
- "Add text saying 'Hello World' to the current page"

## Troubleshooting

**Plugin shows "Disconnected"?**
- Make sure MCP server is running
- Check that nothing else is using port 9223

**Agent can't connect to MCP server?**
- Verify the path to `server/dist/index.js` is correct
- Check agent's MCP configuration syntax

**Operations fail in Figma?**
- Ensure you have a Figma file open
- Check that the plugin is running
- Try restarting the plugin

## Next Steps

- Read the full [README.md](./README.md)
- Check out [API documentation](./API.md)
- Try the example workflows in [EXAMPLES.md](./EXAMPLES.md)
