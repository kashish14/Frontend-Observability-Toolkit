// Dev-server proxy: forwards /api to the mock backend (override with API_TARGET).
module.exports = {
  '/api': {
    target: process.env.API_TARGET || 'http://localhost:3000',
    secure: false,
  },
};
