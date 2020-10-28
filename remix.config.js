const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  appDirectory: './app',
  loadersDirectory: isProd ? './loaders-build' : './loaders',
  serverBuildDirectory: './build',
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  devServerPort: 8002,
}
