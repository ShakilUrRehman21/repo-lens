/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com', 'img.clerk.com'],
    },
    experimental: {
        serverComponentsExternalPackages: ['@neondatabase/serverless'],
    },
}

export default nextConfig
