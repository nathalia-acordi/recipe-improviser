export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify(body),
  };
}

export const STYLES = new Set([
  "simple",
  "funny",
  "gourmet",
  "chaotic"
]);

export const DIETS = new Set([
  "none",
  "vegan",
  "vegetarian",
  "gluten_free",
  "low_cost",
  "lactose_free"
]);
