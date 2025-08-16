const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function json(status, data) {
    return {
        statusCode: status,
        headers: {...CORS, "Content-Type": "application/json"},
        body: JSON.stringify(data)
    };
}

const STYLES = new Set(["simple", "funny", "gourmet", "chaotic"]);
const DIETS = new Set(["none", "vegan", "vegetarian", "gluten_free", "lactose_free", "low_cost"]);