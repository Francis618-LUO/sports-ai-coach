Page({
  data: {
    webUrl: 'https://francis618-luo.github.io/sports-ai-coach/'
  },

  onWebLoad() {
    console.log('WebView 加载成功');
  },

  onWebError(e) {
    console.error('WebView 加载失败', e.detail);
  }
});
