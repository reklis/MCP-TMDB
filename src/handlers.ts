import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { resourceHandlers, resources } from "./resources.js";
import { getResourceTemplate, resourceTemplates } from "./resource-templates.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools } from "./tools.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const setupHandlers = (server: McpServer): void => {
  // Register static resources
  server.resource("TMDB Info", "tmdb://info", async () => {
    const resourceHandler = resourceHandlers["tmdb://info"];
    if (resourceHandler) return await resourceHandler();
    throw new Error("Resource not found: tmdb://info");
  });

  server.resource("Trending Movies", "tmdb://trending", async () => {
    const resourceHandler = resourceHandlers["tmdb://trending"];
    if (resourceHandler) return await resourceHandler();
    throw new Error("Resource not found: tmdb://trending");
  });

  // Register prompts
  Object.entries(prompts).forEach(([name, prompt]) => {
    // Convert the arguments array to a Zod schema
    const argsSchema: Record<string, any> = {};
    prompt.arguments.forEach((arg) => {
      argsSchema[arg.name] = arg.required ? z.string() : z.string().optional();
    });

    server.prompt(name, prompt.description, argsSchema, async (args: any) => {
      const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
      if (promptHandler) {
        const result = promptHandler(args);
        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text: result.messages[0].content.text,
              },
            },
          ],
        };
      }
      throw new Error(`Prompt not found: ${name}`);
    });
  });

  // Register tools
  Object.entries(tools).forEach(([name, tool]) => {
    // Convert inputSchema to Zod schema
    const zodSchema: Record<string, any> = {};
    
    if (tool.inputSchema && tool.inputSchema.properties) {
      Object.entries(tool.inputSchema.properties).forEach(([propName, propDef]: [string, any]) => {
        let propSchema;
        
        if (propDef.type === "string") {
          if (propDef.enum) {
            // Handle enum values
            const enumValues = propDef.enum as [string, ...string[]];
            propSchema = z.enum(enumValues);
          } else {
            propSchema = z.string();
          }
        } else if (propDef.type === "number") {
          propSchema = z.number();
        } else {
          propSchema = z.any();
        }
        
        // Make optional if not in required array
        const requiredFields = tool.inputSchema.required as string[] | undefined;
        if (!requiredFields || !requiredFields.includes(propName)) {
          propSchema = propSchema.optional();
        }
        
        zodSchema[propName] = propSchema;
      });
    }

    server.tool(name, tool.description, zodSchema, async (args: any) => {
      const handler = toolHandlers[name as keyof typeof toolHandlers];
      if (!handler) throw new Error(`Tool not found: ${name}`);
      const result = await handler(args);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    });
  });
};