export default {
  async fetch(request, env) {
    try {
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

      return asset;
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
