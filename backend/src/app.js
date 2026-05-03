import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.routes.js";
import { analysisRouter } from "./routes/analysis.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { requestLoggerMiddleware } from "./middleware/requestLogger.middleware.js";

const JSON_LIMIT = process.env.JSON_BODY_LIMIT || "1mb";

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatJson(value) {
  return escapeHtml(JSON.stringify(value, null, 2));
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: JSON_LIMIT }));

  app.get("/", (req, res) => {
    const doc = {
      name: "Veritas API",
      version: process.env.npm_package_version || "1.0.0",
      baseUrl: "/api",
      auth: {
        type: "Firebase Bearer token",
        header: "Authorization: Bearer <idToken>",
        disableAuthEnv: "DISABLE_AUTH=true",
        note: "When DISABLE_AUTH=true, requests are treated as a dev user without a token.",
      },
      endpoints: [
        {
          method: "GET",
          path: "/api/health",
          authRequired: false,
          description: "Health check for MongoDB and Chroma.",
          response: {
            ok: true,
            mongo: "connected|connecting|disconnected",
            chroma: "up|down_or_skipped",
          },
        },
        {
          method: "POST",
          path: "/api/analyze",
          authRequired: true,
          description: "Run the analysis pipeline on text or a URL.",
          requestBody: {
            input: "string",
            inputType: "text|url",
          },
          response: {
            id: "string",
            input: "string",
            inputType: "text|url",
            createdAt: "ISO-8601 string",
            claims: [
              {
                id: "string",
                text: "string",
                verdict: "true|misleading|false",
                confidence: "number",
                explanation: "string",
                sources: [
                  {
                    title: "string",
                    url: "string",
                    reliabilityScore: "number",
                  },
                ],
              },
            ],
            overallScore: "number",
            summary: "string",
            share: {
              isPublic: "boolean",
              shareId: "string",
            },
          },
        },
        {
          method: "GET",
          path: "/api/history",
          authRequired: true,
          description: "List recent analyses for the authenticated user.",
          response: [
            {
              id: "string",
              input: "string",
              inputType: "text|url",
              createdAt: "ISO-8601 string",
              claims: [
                {
                  id: "string",
                  text: "string",
                  verdict: "true|misleading|false",
                  confidence: "number",
                  explanation: "string",
                  sources: [
                    {
                      title: "string",
                      url: "string",
                      reliabilityScore: "number",
                    },
                  ],
                },
              ],
              overallScore: "number",
              summary: "string",
              share: {
                isPublic: "boolean",
                shareId: "string",
              },
            },
          ],
        },
        {
          method: "GET",
          path: "/api/analysis/:id",
          authRequired: true,
          description: "Fetch a single analysis by id.",
          response: {
            id: "string",
            input: "string",
            inputType: "text|url",
            createdAt: "ISO-8601 string",
            claims: [
              {
                id: "string",
                text: "string",
                verdict: "true|misleading|false",
                confidence: "number",
                explanation: "string",
                sources: [
                  {
                    title: "string",
                    url: "string",
                    reliabilityScore: "number",
                  },
                ],
              },
            ],
            overallScore: "number",
            summary: "string",
            share: {
              isPublic: "boolean",
              shareId: "string",
            },
          },
        },
        {
          method: "POST",
          path: "/api/analysis/:id/share",
          authRequired: true,
          description: "Enable a public share link for an analysis.",
          requestBody: null,
          response: {
            shareId: "string",
            url: "string",
          },
        },
        {
          method: "GET",
          path: "/api/share/:shareId",
          authRequired: false,
          description: "Fetch a publicly shared analysis.",
          response: {
            id: "string",
            input: "string",
            inputType: "text|url",
            createdAt: "ISO-8601 string",
            claims: [
              {
                id: "string",
                text: "string",
                verdict: "true|misleading|false",
                confidence: "number",
                explanation: "string",
                sources: [
                  {
                    title: "string",
                    url: "string",
                    reliabilityScore: "number",
                  },
                ],
              },
            ],
            overallScore: "number",
            summary: "string",
            share: {
              isPublic: "boolean",
              shareId: "string",
            },
          },
        },
      ],
    };

    if (req.headers.accept?.includes("application/json")) {
      res.type("application/json").send(JSON.stringify(doc, null, 2));
      return;
    }

    const endpointsHtml = doc.endpoints
      .map((endpoint) => {
        const methodClass = `method-${endpoint.method.toLowerCase()}`;
        const authText = endpoint.authRequired ? "Yes" : "No";
        const authClass = endpoint.authRequired ? "auth-yes" : "auth-no";
        const requestBlock =
          endpoint.requestBody !== undefined
            ? `<div class="block">
                <div class="label">Request Body</div>
                <pre><code>${endpoint.requestBody === null ? "null" : formatJson(endpoint.requestBody)}</code></pre>
              </div>`
            : "";
        const responseBlock = `<div class="block">
            <div class="label">Response</div>
            <pre><code>${formatJson(endpoint.response)}</code></pre>
          </div>`;

        return `<section class="endpoint">
            <div class="endpoint-header">
              <span class="method ${methodClass}">${endpoint.method}</span>
              <span class="path">${endpoint.path}</span>
              <span class="auth ${authClass}">Auth: ${authText}</span>
            </div>
            <p class="description">${escapeHtml(endpoint.description)}</p>
            ${requestBlock}
            ${responseBlock}
          </section>`;
      })
      .join("\n");

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Veritas API Documentation</title>
    <style>
      :root {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        background: #0b0f14;
        color: #e6edf3;
        line-height: 1.5;
      }
      .container {
        max-width: 980px;
        margin: 40px auto 72px;
        padding: 0 24px;
      }
      header {
        margin-bottom: 32px;
      }
      h1 {
        font-size: 32px;
        margin: 0 0 8px;
      }
      h2 {
        font-size: 20px;
        margin: 28px 0 12px;
      }
      .meta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: #9fb0c0;
      }
      .card {
        background: #11161d;
        border: 1px solid #1e2833;
        border-radius: 12px;
        padding: 16px 20px;
      }
      .endpoint {
        background: #0f141b;
        border: 1px solid #1e2833;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 18px;
      }
      .endpoint-header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .method {
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }
      .method-get {
        background: #163c2a;
        color: #5ff0b7;
      }
      .method-post {
        background: #2b2147;
        color: #caa8ff;
      }
      .path {
        font-family: "Consolas", "Courier New", monospace;
        font-size: 14px;
        color: #e6edf3;
      }
      .auth {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid transparent;
      }
      .auth-yes {
        color: #ffb4a2;
        border-color: #6a2f2a;
      }
      .auth-no {
        color: #a7f3d0;
        border-color: #1f3d2e;
      }
      .description {
        margin: 12px 0 10px;
        color: #c8d3df;
      }
      .block {
        margin-top: 10px;
      }
      .label {
        font-size: 12px;
        text-transform: uppercase;
        color: #9fb0c0;
        letter-spacing: 0.8px;
        margin-bottom: 6px;
      }
      pre {
        margin: 0;
        padding: 12px 14px;
        background: #11161d;
        border: 1px solid #1e2833;
        border-radius: 10px;
        overflow-x: auto;
      }
      code {
        font-family: "Consolas", "Courier New", monospace;
        font-size: 13px;
        color: #d7e0ea;
      }
      .auth-row {
        display: grid;
        gap: 8px;
        margin-top: 8px;
      }
      .auth-row span {
        color: #c8d3df;
      }
      .muted {
        color: #9fb0c0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>Veritas API Documentation</h1>
        <div class="meta">
          <div>Version: ${escapeHtml(doc.version)}</div>
          <div>Base URL: ${escapeHtml(doc.baseUrl)}</div>
        </div>
      </header>

      <section class="card">
        <h2>Authentication</h2>
        <div class="auth-row">
          <span>Type: ${escapeHtml(doc.auth.type)}</span>
          <span>Header: <code>${escapeHtml(doc.auth.header)}</code></span>
          <span class="muted">${escapeHtml(doc.auth.note)}</span>
          <span class="muted">Disable: ${escapeHtml(doc.auth.disableAuthEnv)}</span>
        </div>
      </section>

      <h2>Endpoints</h2>
      ${endpointsHtml}
    </div>
  </body>
</html>`;

    res.type("text/html").send(html);
  });

  app.use("/api/health", healthRouter);
  app.use("/api", analysisRouter);

  app.use(errorMiddleware);
  return app;
}
