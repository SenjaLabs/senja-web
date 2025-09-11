import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */

  // Turbopack configuration
  experimental: {
    turbo: {
      resolveAlias: {
        "@": path.resolve(__dirname, "src"),
        "crypto": "crypto-browserify",
        "stream": "stream-browserify",
        "buffer": "buffer",
        "util": "util",
        "process": "process/browser",
      },
      resolveExtensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
    },
  },

  // Webpack configuration (fallback for production builds)
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    config.resolve.extensions.push(".mjs");

    if (!isServer) {
      // Fix for keyv module resolution issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "@keyv/redis": false,
        "@keyv/mongo": false,
        "@keyv/sqlite": false,
        "@keyv/postgres": false,
        "@keyv/mysql": false,
        "@keyv/etcd": false,
        "@keyv/offline": false,
        "@keyv/tiered": false,
        // Fix for crypto polyfills
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "process": require.resolve("process/browser"),
      };

      // Add plugins for polyfills
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require("webpack")).ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      // Patch the tweetnacl module to fix the PRNG issue
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /node_modules\/tweetnacl\/.*\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: 'var randombytes = function(/* x, n */) { throw new Error(\'no PRNG\'); };',
            replace: `var randombytes = function(x, n) {
              if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(x.subarray(0, n));
              } else if (typeof global !== 'undefined' && global.crypto && global.crypto.getRandomValues) {
                global.crypto.getRandomValues(x.subarray(0, n));
              } else {
                for (let i = 0; i < n; i++) {
                  x[i] = Math.floor(Math.random() * 256);
                }
              }
            };`,
            flags: 'g'
          }
        }
      });
    }

    return config;
  },
};

export default nextConfig;
