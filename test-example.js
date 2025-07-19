// Example usage of the MCP Browser Screenshot Server
// This demonstrates how Claude would use the tools

console.log(`
Example Usage Scenarios:

1. Basic Screenshot:
   - Use tool: browser_navigate
     Parameters: { "url": "https://example.com" }
   - Use tool: screenshot_capture  
     Parameters: { "fullPage": true }

2. Responsive Testing:
   - Use tool: browser_navigate
     Parameters: { "url": "https://example.com" }
   - Use tool: screenshot_viewport
     Parameters: { "preset": "mobile" }
   - Use tool: screenshot_viewport
     Parameters: { "preset": "tablet" }
   - Use tool: screenshot_viewport
     Parameters: { "preset": "desktop" }

3. Element Screenshot:
   - Use tool: browser_navigate
     Parameters: { "url": "https://example.com" }
   - Use tool: screenshot_capture
     Parameters: { "selector": "h1" }

4. Execute JavaScript:
   - Use tool: browser_navigate
     Parameters: { "url": "https://example.com" }
   - Use tool: browser_execute_script
     Parameters: { "script": "document.title" }

5. Close Browser:
   - Use tool: browser_close

The server will return base64-encoded images that Claude can directly analyze.
`);