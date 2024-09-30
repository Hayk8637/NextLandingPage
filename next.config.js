module.exports = {
  output: 'export', 
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true, 
  trailingSlash: true, // Add trailingSlash to handle directory-based routing
  env: {
    CUSTOM_ENV_VARIABLE: 'value', 
  },
};
