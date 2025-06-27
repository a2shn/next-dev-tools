import type { NextConfig } from 'next';

export function withNextDevTools(nextConfig: NextConfig): NextConfig {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (options.dev && options.isServer && options.nextRuntime === 'nodejs') {
        import('./init-ws-server').then(({ initWssServer }) => initWssServer());
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
}
