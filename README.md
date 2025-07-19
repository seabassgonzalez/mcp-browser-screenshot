# MCP Browser Screenshot Server

A Model Context Protocol (MCP) server that provides browser automation and screenshot capabilities through Puppeteer. This server allows AI assistants like Claude to open browsers, navigate to URLs, capture screenshots, and analyze web pages.

## Features

- 🌐 **Browser Control**: Launch, navigate, and close browser instances
- 📸 **Screenshot Capture**: Take full-page or element-specific screenshots
- 📱 **Responsive Testing**: Built-in viewport presets for mobile, tablet, and desktop
- 🔧 **JavaScript Execution**: Run custom scripts in the browser context
- 🖼️ **Base64 Output**: Screenshots returned as base64 for direct AI analysis

## Installation

### For Claude Desktop

1. Clone this repository or install from npm (when published)
2. Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "browser-screenshot": {
      "command": "node",
      "args": ["/path/to/mcp-browser-screenshot/dist/index.js"],
      "env": {
        "HEADLESS": "true"
      }
    }
  }
}
```

### For Development

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-browser-screenshot.git
cd mcp-browser-screenshot

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run in development mode
npm run dev
```

## Available Tools

### 1. `browser_launch`
Launch a new browser instance.

**Parameters:**
- `headless` (boolean, optional): Run browser in headless mode (default: true)

### 2. `browser_navigate`
Navigate to a URL.

**Parameters:**
- `url` (string, required): URL to navigate to
- `waitUntil` (string, optional): When to consider navigation complete
  - Options: "load", "domcontentloaded", "networkidle0", "networkidle2"
  - Default: "networkidle2"

### 3. `browser_close`
Close the browser instance.

### 4. `screenshot_capture`
Take a screenshot of the current page.

**Parameters:**
- `fullPage` (boolean, optional): Capture full page screenshot (default: false)
- `selector` (string, optional): CSS selector of element to screenshot
- `format` (string, optional): Output format - "base64" or "binary" (default: "base64")

### 5. `screenshot_viewport`
Take a screenshot with specific viewport settings.

**Parameters:**
- `preset` (string, optional): Viewport preset - "mobile", "tablet", "desktop", "laptop"
- `width` (number, optional): Custom viewport width
- `height` (number, optional): Custom viewport height
- `fullPage` (boolean, optional): Capture full page screenshot (default: false)

### 6. `browser_execute_script`
Execute JavaScript in the browser context.

**Parameters:**
- `script` (string, required): JavaScript code to execute

## Usage Examples

### Basic Screenshot Workflow

1. Navigate to a website:
```
Use tool: browser_navigate
Parameters: { "url": "https://example.com" }
```

2. Take a screenshot:
```
Use tool: screenshot_capture
Parameters: { "fullPage": true }
```

3. The server returns a base64-encoded image that Claude can analyze directly.

### Responsive Testing

1. Navigate to your site:
```
Use tool: browser_navigate
Parameters: { "url": "https://myapp.com" }
```

2. Capture mobile view:
```
Use tool: screenshot_viewport
Parameters: { "preset": "mobile" }
```

3. Capture tablet view:
```
Use tool: screenshot_viewport
Parameters: { "preset": "tablet" }
```

4. Capture desktop view:
```
Use tool: screenshot_viewport
Parameters: { "preset": "desktop" }
```

### Element-Specific Screenshots

```
Use tool: screenshot_capture
Parameters: { 
  "selector": "#header",
  "format": "base64"
}
```

### Execute Custom JavaScript

```
Use tool: browser_execute_script
Parameters: {
  "script": "document.querySelector('.button').click()"
}
```

## Environment Variables

- `HEADLESS`: Set to "false" to run browser in non-headless mode (useful for debugging)

## Viewport Presets

- **Mobile**: 375x812 @ 3x scale
- **Tablet**: 768x1024 @ 2x scale  
- **Desktop**: 1920x1080 @ 1x scale
- **Laptop**: 1366x768 @ 1x scale

## Development

### Building

```bash
npm run build
```

### Watching for changes

```bash
npm run watch
```

### Running tests

```bash
npm test
```

## Troubleshooting

### Browser won't launch
- Ensure Puppeteer dependencies are installed
- On Linux, you may need additional system packages
- Try setting `HEADLESS=false` to see browser errors

### Screenshots are blank
- Ensure the page has fully loaded before taking screenshots
- Use `waitUntil: "networkidle2"` for dynamic content
- Check if the selector exists on the page

## License

MIT

## Contributing

Contributions are welcome! Please submit pull requests or open issues for bugs and feature requests.