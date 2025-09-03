export const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export function json(status, data, extraHeaders = {}) {
    return {
        statusCode: status,
        headers: {
            "Content-Type": "application/json",
            ...CORS,
            ...extraHeaders
        },
        body: JSON.stringify(data)
    }
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