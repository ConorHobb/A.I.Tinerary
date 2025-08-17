import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // This is a workaround for a bug in Next.js where it tries to process CSS
    // files from node_modules on the server. Since we're using MapLibre, which
    // includes a CSS file, we need to tell Webpack to ignore it on the server.
    if (isServer) {
      config.module.rules.push({
        test: /maplibre-gl\/dist\/maplibre-gl\.css$/,
        loader: 'null-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
