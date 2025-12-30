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
      const url = new URL(request.url);
      let pathname = url.pathname;

      if (pathname === "/" || pathname === "") {
        pathname = "/index.html";
      }

      const assetPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

      if (!env || !env.ASSETS) {
        return new Response("Assets binding not configured. Check wrangler.toml configuration.", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }

      const assetRequest = new Request(new URL(assetPath, request.url), {
        method: request.method,
        headers: request.headers,
      });

      let asset = await env.ASSETS.fetch(assetRequest);
      if (asset.status === 404 && pathname !== "/index.html") {
        const indexRequest = new Request(new URL("index.html", request.url), {
          method: request.method,
          headers: request.headers,
        });
        asset = await env.ASSETS.fetch(indexRequest);
      }
      const body = await asset.arrayBuffer();
      const headers = new Headers(asset.headers);

      if (!headers.has("Content-Type")) {
        const contentType = getContentType(pathname);
        if (contentType) {
          headers.set("Content-Type", contentType);
        }
      }

      if (pathname.endsWith(".html") || pathname === "/" || pathname === "") {
        headers.set("Content-Type", "text/html; charset=utf-8");
      }

      return new Response(body, {
        status: asset.status,
        statusText: asset.statusText,
        headers: headers,
      });
    } catch (error) {
      return new Response(`Worker Error: ${error.message}\nStack: ${error.stack}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
