/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    }
})
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true
}

module.exports = withPWA(nextConfig)
