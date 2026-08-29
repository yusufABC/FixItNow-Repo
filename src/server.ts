import app from "./app";
import config from "./config";

const PORT = config.port || 5000;

async function main() {
  try {
    // Only listen if not running in a serverless environment (like Vercel)
    if (config.env !== "production" || !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

main();

export default app;