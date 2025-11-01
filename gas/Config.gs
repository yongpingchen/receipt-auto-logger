// ============================================
// 📋 Config.gs - 配置模块
// ============================================

const CONFIG = {
  // 🔑 API 密钥
  VISION_API_KEY: 'YOUR_VISION_API_KEY_HERE',
  
  // 📊 Google Sheet
  SHEET_ID: 'YOUR_SHEET_ID_HERE',
  
  // 🔒 安全令牌
  SECRET_TOKEN: 'test123',
  
  // 🎯 置信度阈值
  CONFIDENCE_THRESHOLD: {
    HIGH: 85,    // 直接入库
    MEDIUM: 60   // 需要复核
  },
  
  // 🐛 调试模式
  DEBUG_MODE: true  // 设为 false 关闭详细日志
};

// 调试日志函数
function debugLog(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    // 同时使用 console.log 和 Logger.log
    console.log('[DEBUG] ' + message);
    Logger.log('[DEBUG] ' + message);
    
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      console.log(dataStr);
      Logger.log(dataStr);
    }
  }
}