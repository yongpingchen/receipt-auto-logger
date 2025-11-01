// ============================================
// 📋 Config.gs - 配置模块
// ============================================

var CONFIG = {
  // 🔑 API 配置（从 Script Properties 读取）
  VISION_API_KEY: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY'),
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID'),
  SECRET_TOKEN: PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN') || 'test123',
  
  // 🎯 置信度阈值
  CONFIDENCE_THRESHOLD: {
    HIGH: 85,    // 直接入库
    MEDIUM: 60   // 需要复核
  },
  
  // 🐛 调试模式
  DEBUG_MODE: true  // 设为 false 关闭详细日志
};

/**
 * 调试日志函数
 * @param {string} message - 日志消息
 * @param {*} data - 可选的数据对象
 */
function debugLog(message, data) {
  if (!CONFIG.DEBUG_MODE) return;
  
  var timestamp = new Date().toISOString();
  var logMessage = '[' + timestamp + '] ' + message;
  
  // 同时输出到 Logger 和 console
  console.log(logMessage);
  Logger.log(logMessage);
  
  if (data !== undefined) {
    var dataStr = typeof data === 'object' 
      ? JSON.stringify(data, null, 2)
      : String(data);
    console.log(dataStr);
    Logger.log(dataStr);
  }
}
