import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — an unrelated pnpm-lock.yaml
  // in the user's home directory otherwise confuses Next's auto-detection.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
