import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { resourceHandlers, resources } from "./resources.js";
import { getResourceTemplate, resourceTemplates } from "./resource-templates.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools } from "./tools.js";
export const setupHandlers = (server) => {
    // Resource handlers
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources }));
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
        resourceTemplates,
    }));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        // Using type assertion to tell TypeScript this is a valid key
        const resourceHandler = resourceHandlers[uri];
        if (resourceHandler)
            return await resourceHandler();
        const resourceTemplateHandler = await getResourceTemplate(uri);
        if (resourceTemplateHandler)
            return await resourceTemplateHandler();
        throw new Error(`Resource not found: ${uri}`);
    });
    // Prompt handlers
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: Object.values(prompts),
    }));
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        // Using type assertion to tell TypeScript this is a valid key
        const promptHandler = promptHandlers[name];
        if (promptHandler) {
            // Use a type-safe approach that checks the expected prompt name
            if (name === "movie-review") {
                return promptHandler(args);
            }
            else if (name === "movie-recommendation") {
                return promptHandler(args);
            }
            // Fallback for unknown prompt names
            return promptHandler(args);
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
        const handler = toolHandlers[name];
        if (!handler)
            throw new Error(`Tool not found: ${name}`);
        if (name === "search-movies") {
            return await handler(args);
        }
        else if (name === "get-trending") {
            return await handler(args);
        }
        else if (name === "get-similar") {
            return await handler(args);
        }
        // Fallback for unknown tool names
        return await handler(args);
    });
};
