import type { NextConfig } from 'next';

export function withNextDevTools(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (options.dev && options.isServer && options.nextRuntime === 'nodejs') {
        import('./wss').then(({ Wss }) => Wss());
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
}
