export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    }

    const assetPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    const asset = await env.ASSETS.fetch(new Request(new URL(assetPath, request.url)));

    if (asset.status === 404) {
      const indexAsset = await env.ASSETS.fetch(
        new Request(new URL("index.html", request.url))
      );
      return indexAsset;
    }

    return asset;
  },
};
