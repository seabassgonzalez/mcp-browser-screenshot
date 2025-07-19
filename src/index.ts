#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";

interface BrowserState {
  browser: Browser | null;
  page: Page | null;
}

const browserState: BrowserState = {
  browser: null,
  page: null,
};

interface ViewportPreset {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

const viewportPresets: Record<string, ViewportPreset> = {
  mobile: {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  tablet: {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  desktop: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  },
  laptop: {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  },
};

const server = new Server(
  {
    name: "mcp-browser-screenshot",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function ensureBrowser(): Promise<{ browser: Browser; page: Page }> {
  if (!browserState.browser || !browserState.browser.isConnected()) {
    const headless = process.env.HEADLESS !== "false";
    browserState.browser = await puppeteer.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    browserState.page = await browserState.browser.newPage();
  }

  if (!browserState.page || browserState.page.isClosed()) {
    browserState.page = await browserState.browser.newPage();
  }

  return {
    browser: browserState.browser,
    page: browserState.page,
  };
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "browser_launch",
        description: "Launch a new browser instance",
        inputSchema: {
          type: "object",
          properties: {
            headless: {
              type: "boolean",
              description: "Run browser in headless mode",
              default: true,
            },
          },
        },
      },
      {
        name: "browser_navigate",
        description: "Navigate to a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to navigate to",
            },
            waitUntil: {
              type: "string",
              enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
              description: "When to consider navigation complete",
              default: "networkidle2",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "browser_close",
        description: "Close the browser instance",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "screenshot_capture",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            fullPage: {
              type: "boolean",
              description: "Capture full page screenshot",
              default: false,
            },
            selector: {
              type: "string",
              description: "CSS selector of element to screenshot",
            },
            format: {
              type: "string",
              enum: ["base64", "binary"],
              description: "Output format for the screenshot",
              default: "base64",
            },
          },
        },
      },
      {
        name: "screenshot_viewport",
        description: "Take a screenshot with specific viewport settings",
        inputSchema: {
          type: "object",
          properties: {
            preset: {
              type: "string",
              enum: ["mobile", "tablet", "desktop", "laptop"],
              description: "Viewport preset to use",
            },
            width: {
              type: "number",
              description: "Custom viewport width",
            },
            height: {
              type: "number",
              description: "Custom viewport height",
            },
            fullPage: {
              type: "boolean",
              description: "Capture full page screenshot",
              default: false,
            },
          },
        },
      },
      {
        name: "browser_execute_script",
        description: "Execute JavaScript in the browser context",
        inputSchema: {
          type: "object",
          properties: {
            script: {
              type: "string",
              description: "JavaScript code to execute",
            },
          },
          required: ["script"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "browser_launch": {
        const headless = args?.headless !== false;
        if (browserState.browser) {
          await browserState.browser.close();
        }
        browserState.browser = await puppeteer.launch({
          headless,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        browserState.page = await browserState.browser.newPage();
        return {
          content: [
            {
              type: "text",
              text: "Browser launched successfully",
            },
          ],
        };
      }

      case "browser_navigate": {
        const { page } = await ensureBrowser();
        const url = args?.url as string;
        const waitUntil = (args?.waitUntil as any) || "networkidle2";
        
        await page.goto(url, { waitUntil });
        
        return {
          content: [
            {
              type: "text",
              text: `Navigated to ${url}`,
            },
          ],
        };
      }

      case "browser_close": {
        if (browserState.browser) {
          await browserState.browser.close();
          browserState.browser = null;
          browserState.page = null;
        }
        return {
          content: [
            {
              type: "text",
              text: "Browser closed",
            },
          ],
        };
      }

      case "screenshot_capture": {
        const { page } = await ensureBrowser();
        const fullPage = args?.fullPage === true;
        const selector = args?.selector as string | undefined;
        const format = (args?.format as string) || "base64";

        let screenshot: Buffer;
        
        if (selector) {
          const element = await page.$(selector);
          if (!element) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Element with selector "${selector}" not found`
            );
          }
          screenshot = (await element.screenshot()) as Buffer;
        } else {
          screenshot = (await page.screenshot({ fullPage })) as Buffer;
        }

        if (format === "base64") {
          return {
            content: [
              {
                type: "text",
                text: `data:image/png;base64,${screenshot.toString("base64")}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: "Screenshot captured as binary data",
              },
            ],
          };
        }
      }

      case "screenshot_viewport": {
        const { page } = await ensureBrowser();
        const preset = args?.preset as string | undefined;
        const width = args?.width as number | undefined;
        const height = args?.height as number | undefined;
        const fullPage = args?.fullPage === true;

        if (preset && viewportPresets[preset]) {
          await page.setViewport(viewportPresets[preset]);
        } else if (width && height) {
          await page.setViewport({ width, height });
        } else {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Either preset or width/height must be provided"
          );
        }

        const screenshot = (await page.screenshot({ fullPage })) as Buffer;
        
        return {
          content: [
            {
              type: "text",
              text: `data:image/png;base64,${screenshot.toString("base64")}`,
            },
          ],
        };
      }

      case "browser_execute_script": {
        const { page } = await ensureBrowser();
        const script = args?.script as string;
        
        const result = await page.evaluate((scriptToRun) => {
          return eval(scriptToRun);
        }, script);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error}`
    );
  }
});

async function cleanup() {
  if (browserState.browser) {
    await browserState.browser.close();
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Browser Screenshot Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});