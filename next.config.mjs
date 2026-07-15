/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve every old hand-built URL: 308-redirect the .html files to the
  // clean routes so existing links / bookmarks / search results never break.
  async redirects() {
    return [
      { source: '/x.html', destination: '/', permanent: true },
      { source: '/everything-zanzibar.html', destination: '/', permanent: true },
      { source: '/everything-zanzibar-booking.html', destination: '/booking', permanent: true },
      { source: '/everything-zanzibar-activities.html', destination: '/activities', permanent: true },
      { source: '/everything-zanzibar-blog.html', destination: '/blog', permanent: true },
      { source: '/everything-zanzibar-founders.html', destination: '/founders', permanent: true },
      { source: '/everything-zanzibar-admin.html', destination: '/admin', permanent: true },
    ];
  },
};
export default nextConfig;
