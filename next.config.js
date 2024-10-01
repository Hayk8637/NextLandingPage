module.exports = {
  output: 'export', 
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true, 
  async rewrites() {
    return [
      {
        source: '/profile/establishments/:slug',  // Corrected the path from './profile/estiblishments/:slug' to '/profile/establishments/:slug'
        destination: '/profile/establishments/:slug', // Make sure this points to the correct destination in your app
      },
    ];
  }, 
  trailingSlash: true,
  env: {
    CUSTOM_ENV_VARIABLE: 'value', 
  },
};
