import { resourceHandlers } from "./resources.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools } from "./tools.js";
import { z } from "zod";
export const setupHandlers = (server) => {
    // Register static resources
    server.resource("TMDB Info", "tmdb://info", async () => {
        const resourceHandler = resourceHandlers["tmdb://info"];
        if (resourceHandler)
            return await resourceHandler();
        throw new Error("Resource not found: tmdb://info");
    });
    server.resource("Trending Movies", "tmdb://trending", async () => {
        const resourceHandler = resourceHandlers["tmdb://trending"];
        if (resourceHandler)
            return await resourceHandler();
        throw new Error("Resource not found: tmdb://trending");
    });
    // Register prompts
    Object.entries(prompts).forEach(([name, prompt]) => {
        // Convert the arguments array to a Zod schema
        const argsSchema = {};
        prompt.arguments.forEach((arg) => {
            argsSchema[arg.name] = arg.required ? z.string() : z.string().optional();
        });
        server.prompt(name, prompt.description, argsSchema, async (args) => {
            const promptHandler = promptHandlers[name];
            if (promptHandler) {
                const result = promptHandler(args);
                return {
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
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
        // For now, use a simple object schema for all tools to avoid enum issues
        const zodSchema = {};
        server.tool(name, tool.description, zodSchema, async (args) => {
            const handler = toolHandlers[name];
            if (!handler)
                throw new Error(`Tool not found: ${name}`);
            const result = await handler(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        });
    });
};
