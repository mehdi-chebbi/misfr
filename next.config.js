/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['sh.dataspace.copernicus.eu', 'tile.openstreetmap.org', 'server.arcgisonline.com', 'basemaps.cartocdn.com', 'tile.opentopomap.org'],
  },
}

module.exports = nextConfig