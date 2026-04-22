const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ─────────────────────────────────────────────────────────────────────────────
// FIX: "Cannot use import.meta outside a module"
//
// Metro's `unstable_enablePackageExports: true` (new default) follows the
// "exports" field in package.json, which for zustand and other packages points
// to .mjs ESM files that contain `import.meta.env`. Metro's web bundler cannot
// handle import.meta, so we disable exports resolution and add an explicit
// CJS redirect for zustand/middleware.
// ─────────────────────────────────────────────────────────────────────────────
config.resolver = {
  ...config.resolver,

  // Disable package "exports" field — forces Metro to use "main" (CJS) instead
  unstable_enablePackageExports: false,

  resolveRequest: (context, moduleName, platform) => {
    // Always route zustand/middleware to the CJS build
    if (moduleName === "zustand/middleware") {
      return {
        filePath: path.resolve(
          __dirname,
          "node_modules/zustand/middleware.js"
        ),
        type: "sourceFile",
      };
    }
    // Route @vercel/analytics/react to the CJS build
    if (moduleName === "@vercel/analytics/react") {
      return {
        filePath: path.resolve(
          __dirname,
          "node_modules/@vercel/analytics/dist/react/index.js"
        ),
        type: "sourceFile",
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
