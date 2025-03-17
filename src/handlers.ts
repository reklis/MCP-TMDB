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
  import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
  
  export const setupHandlers = (server: Server): void => {
    // Resource handlers
    server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({ resources }),
    );
    
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates,
    }));
    
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      // Using type assertion to tell TypeScript this is a valid key
      const resourceHandler = resourceHandlers[uri as keyof typeof resourceHandlers];
      if (resourceHandler) return await resourceHandler();
      
      const resourceTemplateHandler = await getResourceTemplate(uri);
      if (resourceTemplateHandler) return await resourceTemplateHandler();
      
      throw new Error(`Resource not found: ${uri}`);
    });
  
    // Prompt handlers
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: Object.values(prompts),
    }));
    
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      // Using type assertion to tell TypeScript this is a valid key
      const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
      
      if (promptHandler) {
        // Use a type-safe approach that checks the expected prompt name
        if (name === "movie-review") {
          return promptHandler(args as any);
        } else if (name === "movie-recommendation") {
          return promptHandler(args as any);
        }
        
        // Fallback for unknown prompt names
        return promptHandler(args as any);
      }
      
      throw new Error(`Prompt not found: ${name}`);
    });
  
    // Tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Object.values(tools),
    }));
  
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      // Using type assertion to tell TypeScript this is a valid key
      const handler = toolHandlers[name as keyof typeof toolHandlers];
  
      if (!handler) throw new Error(`Tool not found: ${name}`);
  
      if (name === "search-movies") {
        return await handler(args as any);
      } else if (name === "get-trending") {
        return await handler(args as any);
      } else if (name === "get-similar") {
        return await handler(args as any);
      }
      
      // Fallback for unknown tool names
      return await handler(args as any);
    });
  };