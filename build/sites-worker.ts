import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, async () => {
      const response=await handler.fetch(request, env, ctx);
      const headers=new Headers(response.headers);
      headers.set('X-Content-Type-Options','nosniff');
      headers.set('Referrer-Policy','no-referrer');
      headers.set('X-Frame-Options','DENY');
      headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
      if(!import.meta.env.DEV){headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'");headers.set('Strict-Transport-Security','max-age=31536000');}
      // Account pages and token-bearing links must never be cached by shared intermediaries.
      if(new URL(request.url).pathname!=='/api/library/catalog'&&!new URL(request.url).pathname.startsWith('/api/library/cover/')&&response.headers.get('Content-Type')?.includes('text/html'))headers.set('Cache-Control','private, no-store');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    });
  },
};
