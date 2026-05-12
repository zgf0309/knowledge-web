import type { ClientRequest, IncomingMessage } from 'node:http';

/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // 如果需要自定义本地开发服务器  请取消注释按需调整
  // dev: {
  //   // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
  //   '/api/': {
  //     // 要代理的地址
  //     target: 'https://preview.pro.ant.design',
  //     // 配置了这个可以从 http 代理到 https
  //     // 依赖 origin 的功能可能需要这个，比如 cookie
  //     changeOrigin: true,
  //   },
  // },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  dev: {
    // 统一代理所有后端请求：/knowledge-api/** -> http://127.0.0.1:8010/**
    // 使用 127.0.0.1 避免部分环境 localhost 解析到 IPv6 导致代理失败。
    '/knowledge-api/': {
      target: 'http://127.0.0.1:8010',
      changeOrigin: true,
      pathRewrite: { '^/knowledge-api': '' },
      selfHandleResponse: false,
      proxyTimeout: 0,
      timeout: 0,
      onProxyReq(proxyReq: ClientRequest) {
        proxyReq.setHeader('Accept', 'text/event-stream');
        proxyReq.setHeader('Cache-Control', 'no-cache');
        proxyReq.setHeader('Connection', 'keep-alive');
      },
      onProxyRes(proxyRes: IncomingMessage) {
        delete proxyRes.headers['content-length'];
        proxyRes.headers['cache-control'] = 'no-cache, no-transform';
        proxyRes.headers['connection'] = 'keep-alive';
        proxyRes.headers['x-accel-buffering'] = 'no';
      },
    },
  },
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'http://127.0.0.1:8010',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'http://127.0.0.1:8010',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
