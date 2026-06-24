Page({
  data: {
    // 替换为你的 Vercel 部署地址
    webUrl: 'https://YOUR-PROJECT.vercel.app'
  },

  onWebLoad() {
    console.log('WebView 加载成功');
  },

  onWebError(e) {
    console.error('WebView 加载失败', e.detail);
  }
});
