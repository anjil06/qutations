/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/quotation',
        destination: '/quotations',
        permanent: true,
      },
      {
        source: '/create-quotation',
        destination: '/quotations/new',
        permanent: true,
      },
      {
        source: '/qotations',
        destination: '/quotations',
        permanent: true,
      },
      {
        source: '/qotation',
        destination: '/quotations',
        permanent: true,
      },
      {
        source: '/quptations',
        destination: '/quotations',
        permanent: true,
      },
      {
        source: '/quptation',
        destination: '/quotations',
        permanent: true,
      },
      {
        source: '/quptations/new',
        destination: '/quotations/new',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
