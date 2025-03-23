/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '**' },
    ],
  },
  transpilePackages: [
    'antd',
    'rc-picker',
    'rc-util',
    '@ant-design/icons',
    'rc-pagination',
    'rc-notification',
  ],
};

module.exports = nextConfig;
