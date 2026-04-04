import { serve } from "@hono/node-server";
import healthCheckServer from "./server";

// ... Discord BOTのコード ...

// Koyeb用のヘルスチェックサーバーを起動
serve({
  fetch: healthCheckServer.fetch,
  port: 8000,
});
import { startHealthCheckCron } from "./cron";

// ... Discord BOTのコード ...

serve({
  fetch: healthCheckServer.fetch,
  port: 8000,
});
startHealthCheckCron();
