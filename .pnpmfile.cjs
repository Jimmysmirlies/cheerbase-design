// Allowlist build scripts needed for Prisma and related native deps in CI (e.g., Vercel).
module.exports = {
  hooks: {
    readPackage(pkg) {
      return pkg
    },
  },
  config: {
    allowedBuildScripts: [
      "@prisma/client",
      "@prisma/engines",
      "prisma",
      "esbuild",
      "@tailwindcss/oxide",
      "core-js-pure",
      "sharp",
    ],
  },
}
