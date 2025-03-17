import { searchMovies, getTrendingMovies, getSimilarMovies, } from "./tmdb-api.js";
export const tools = {
    "search-movies": {
        name: "search-movies",
        description: "Search for movies by title or keywords",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query",
                },
                page: {
                    type: "number",
                    description: "Page number for results",
                },
            },
            required: ["query"],
        },
    },
    "get-trending": {
        name: "get-trending",
        description: "Get trending movies",
        inputSchema: {
            type: "object",
            properties: {
                timeWindow: {
                    type: "string",
                    enum: ["day", "week"],
                    description: "Time window for trending movies",
                },
            },
            required: [],
        },
    },
    "get-similar": {
        name: "get-similar",
        description: "Get similar movies to a given movie",
        inputSchema: {
            type: "object",
            properties: {
                movieId: {
                    type: "string",
                    description: "ID of the movie to find similar movies for",
                },
            },
            required: ["movieId"],
        },
    },
};
export const toolHandlers = {
    "search-movies": async ({ query, page = 1 }) => {
        try {
            const results = await searchMovies(query, page);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to search movies: ${error.message}`);
            }
            throw new Error('Failed to search movies: Unknown error');
        }
    },
    "get-trending": async ({ timeWindow }) => {
        try {
            const results = await getTrendingMovies(timeWindow);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get trending movies: ${error.message}`);
            }
            throw new Error('Failed to get trending movies: Unknown error');
        }
    },
    "get-similar": async ({ movieId }) => {
        try {
            const results = await getSimilarMovies(movieId);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get similar movies: ${error.message}`);
            }
            throw new Error('Failed to get similar movies: Unknown error');
        }
    },
};
