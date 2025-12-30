// Helper function to determine content type
function getContentType(pathname) {
  const ext = pathname.split(".").pop()?.toLowerCase();
  const types = {
    html: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
  };
  return types[ext] || "text/plain";
}

export default {
  async fetch(request, env) {
    try {
      // Handle CORS preflight requests
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      const url = new URL(request.url);
      let pathname = url.pathname;

      // Default to index.html for root
      if (pathname === "/" || pathname === "") {
        pathname = "/index.html";
      }

      // Remove leading slash
      const assetPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

      // Check if ASSETS binding exists
      if (!env || !env.ASSETS) {
        return new Response("Assets binding not configured. Check wrangler.toml configuration.", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Create a new request for the asset
      const assetRequest = new Request(new URL(assetPath, request.url), {
        method: request.method,
        headers: request.headers,
      });

      // Fetch the asset
      let asset = await env.ASSETS.fetch(assetRequest);

      // If not found, try index.html (for SPA routing)
      if (asset.status === 404 && pathname !== "/index.html") {
        const indexRequest = new Request(new URL("index.html", request.url), {
          method: request.method,
          headers: request.headers,
        });
        asset = await env.ASSETS.fetch(indexRequest);
      }

      // Clone the response to modify headers
      const response = new Response(asset.body, asset);

      // Add CORS headers for social media crawlers
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");

      // Set proper content type if not already set
      if (!response.headers.has("Content-Type")) {
        const contentType = getContentType(pathname);
        if (contentType) {
          response.headers.set("Content-Type", contentType);
        }
      }

      // Allow LinkedIn and other social media crawlers
      response.headers.set("X-Robots-Tag", "index, follow");

      return response;
    } catch (error) {
      // Return error response with details
      return new Response(
        `Worker Error: ${error.message}\nStack: ${error.stack}`,
        {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }
  },
};
