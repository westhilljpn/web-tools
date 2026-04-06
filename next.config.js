const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 外部画像ドメインが必要になった場合はここに追加
  images: {
    domains: [],
  },
};

module.exports = withNextIntl(nextConfig);
