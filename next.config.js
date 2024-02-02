/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: "public",
    cacheOnFrontEndNav: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
})
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
}

module.exports = withPWA(nextConfig)
