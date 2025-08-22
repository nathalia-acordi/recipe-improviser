export const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export function json(status, data, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...CORS,
            ...extraHeaders
        }
    });
}

export const STYLES = new Set([
    "simple",
    "funny",
    "gourmet",
    "chaotic"
]);

export const DIETS = new Set([
    "vegan",
    "vegetarian",
    "gluten-free",
    "low-cost",
    "lactose-free"
]);