// ============================================
// 👁️ VisionAPI.gs - OCR 识别模块（新增 Drive 上传）
// ============================================

/**
 * 调用 Google Cloud Vision API 并上传文件到 Drive
 * @param {Byte[]} imageBytes - 图片字节数组
 * @return {Object} {text: string, fileId: string, fileUrl: string}
 */
function callVisionAPI(imageBytes) {
    debugLog('开始调用 Vision API');
    debugLog('图片大小: ' + imageBytes.length + ' bytes');
    
    var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + CONFIG.VISION_API_KEY;
    
    var payload = {
      requests: [{
        image: { content: Utilities.base64Encode(imageBytes) },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        imageContext: {
          languageHints: ['ja', 'en']
        }
      }]
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(url, options);
      var statusCode = response.getResponseCode();
      var responseText = response.getContentText();
      
      debugLog('API 状态码: ' + statusCode);
      
      if (statusCode !== 200) {
        throw new Error('API 请求失败 (HTTP ' + statusCode + '): ' + responseText);
      }
      
      var result = JSON.parse(responseText);
      
      if (!result.responses || !result.responses[0]) {
        throw new Error('API 响应格式错误: ' + responseText);
      }
      
      if (result.responses[0].error) {
        var error = result.responses[0].error;
        throw new Error('Vision API 错误: ' + error.message + ' (代码: ' + error.code + ')');
      }
      
      var text = result.responses[0].fullTextAnnotation?.text || '';
      
      if (!text) {
        debugLog('⚠️ 未识别到任何文字');
        return {
          text: '无法识别文字',
          fileId: null,
          fileUrl: null
        };
      }
      
      debugLog('✅ OCR 成功，识别到 ' + text.length + ' 个字符');
      
      // 🔥 上传到 Drive（使用临时文件名）
      var driveResult = uploadToDrive(imageBytes);
      
      return {
        text: text,
        fileId: driveResult.fileId,
        fileUrl: driveResult.fileUrl
      };
      
    } catch (error) {
      debugLog('❌ Vision API 调用失败: ' + error.toString());
      throw error;
    }
  }
  
  /**
   * 上传图片到 Google Drive（临时文件名）
   * @param {Byte[]} imageBytes - 图片字节数组
   * @return {Object} {fileId: string, fileUrl: string}
   */
  function uploadToDrive(imageBytes) {
    debugLog('开始上传到 Google Drive');
    
    try {
      // 获取目标文件夹
      var folderId = CONFIG.DRIVE_FOLDER_ID;
      var folder;
      
      if (folderId) {
        folder = DriveApp.getFolderById(folderId);
      } else {
        // 如果没有配置文件夹，使用根目录
        folder = DriveApp.getRootFolder();
        debugLog('⚠️ 未配置 DRIVE_FOLDER_ID，使用根目录');
      }
      
      // 生成临时文件名：timestamp_random.jpg
      var timestamp = new Date().getTime();
      var random = Math.floor(Math.random() * 10000);
      var tempFileName = 'receipt_temp_' + timestamp + '_' + random + '.jpg';
      
      // 创建 Blob
      var blob = Utilities.newBlob(imageBytes, 'image/jpeg', tempFileName);
      
      // 上传文件
      var file = folder.createFile(blob);
      var fileId = file.getId();
      var fileUrl = file.getUrl();
      
      debugLog('✅ 文件已上传到 Drive');
      debugLog('文件 ID: ' + fileId);
      debugLog('文件名: ' + tempFileName);
      debugLog('文件 URL: ' + fileUrl);
      
      return {
        fileId: fileId,
        fileUrl: fileUrl
      };
      
    } catch (error) {
      debugLog('❌ Drive 上传失败: ' + error.toString());
      // 即使上传失败，也不影响 OCR 流程
      return {
        fileId: null,
        fileUrl: null
      };
    }
  }
  
  /**
   * 重命名 Drive 文件为最终格式
   * @param {string} fileId - 文件 ID
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @param {string} store - 店名
   * @param {number} amount - 金额
   */
  function renameReceiptFile(fileId, date, store, amount) {
    debugLog('开始重命名文件: ' + fileId);
    
    try {
      var file = DriveApp.getFileById(fileId);
      
      // 格式化日期：YYYY-MM-DD → YYYYMMDD
      var formattedDate = date.replace(/-/g, '');
      
      // 清理店名（移除非法字符）
      var cleanStore = store.replace(/[/\\?%*:|"<>]/g, '_');
      
      // 生成新文件名：YYYYMMDD_[店名]_金额.jpg
      var newFileName = formattedDate + '_[' + cleanStore + ']_' + amount + '.jpg';
      
      file.setName(newFileName);
      
      debugLog('✅ 文件已重命名为: ' + newFileName);
      
    } catch (error) {
      debugLog('❌ 文件重命名失败: ' + error.toString());
      throw new Error('文件重命名失败: ' + error.message);
    }
  }
  
  /**
   * 测试 Vision API 配置
   */
  function testVisionAPI() {
    try {
      var testImage = Utilities.newBlob(
        Utilities.base64Decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
        'image/png'
      ).getBytes();
      
      Logger.log('🧪 开始测试 Vision API...');
      var result = callVisionAPI(testImage);
      Logger.log('✅ Vision API 配置正确！');
      Logger.log('文件 ID: ' + result.fileId);
      return true;
      
    } catch (error) {
      Logger.log('❌ Vision API 测试失败: ' + error.toString());
      return false;
    }
  }

  // GAS 编辑器中运行
function testDriveUpload() {
    var testImage = Utilities.newBlob(
      Utilities.base64Decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
      'image/png'
    ).getBytes();
    
    // 测试上传
    var result = uploadToDrive(testImage);
    Logger.log('文件 ID: ' + result.fileId);
    
    // 测试重命名
    renameReceiptFile(result.fileId, '2025-11-03', 'テスト店', 1250);
    Logger.log('✅ 测试完成，请检查 Drive 文件夹');
  }