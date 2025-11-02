// ============================================
// 📦 utils.js - 通用工具函数模块
// ============================================

/**
 * 验证文件格式和大小
 * @param {File} file - 文件对象
 * @return {boolean} 验证是否通过
 */
function validateFile(file) {
    // 检查是否为 HEIC 格式
    if (APP_CONFIG.BLOCKED_EXTENSIONS.some(function(ext) {
        return file.name.toLowerCase().endsWith(ext);
    })) {
        throw new Error('不支持 HEIC 格式，请使用 JPG/PNG');
    }
    
    // 检查是否为图片
    if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
    }
    
    // 检查文件大小
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        throw new Error('图片太大（最大 5MB）');
    }
    
    return true;
}

/**
 * 将文件转换为 Base64
 * @param {File} file - 文件对象
 * @return {Promise<string>} Base64 字符串
 */
function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { 
            resolve(reader.result); 
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 发送 HTTP 请求到 GAS API
 * @param {string} apiUrl - API 地址
 * @param {string} token - 认证 token
 * @param {string} base64Image - Base64 编码的图片
 * @return {Promise<Object>} API 响应
 */
function sendRequest(apiUrl, token, base64Image) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var timeoutId = setTimeout(function() {
            xhr.abort();
            reject(new Error('请求超时（30秒）'));
        }, APP_CONFIG.REQUEST_TIMEOUT);
        
        xhr.open('POST', apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');  // ✅ 使用 text/plain 避免预检
        
        xhr.onload = function() {
            clearTimeout(timeoutId);
            if (xhr.status === 200) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject(new Error('响应解析失败'));
                }
            } else {
                reject(new Error('HTTP ' + xhr.status));
            }
        };
        
        xhr.onerror = function() {
            clearTimeout(timeoutId);
            reject(new Error('网络错误'));
        };
        
        xhr.send(JSON.stringify({
            token: token,
            image_base64: base64Image
        }));
    });
}

/**
 * 显示识别成功结果
 * @param {HTMLElement} resultDiv - 结果显示区域
 * @param {Object} data - API 返回数据
 */
function displayResult(resultDiv, data) {
    if (data.success) {
        resultDiv.className = 'success';
        resultDiv.innerHTML = 
            '<h3>✅ 识别成功</h3>' +
            '<div class="result-item"><strong>日期:</strong> ' + data.result.date + '</div>' +
            '<div class="result-item"><strong>金额:</strong> ¥' + data.result.amount + '</div>' +
            '<div class="result-item"><strong>店名:</strong> ' + data.result.store + '</div>' +
            '<div class="result-item"><strong>置信度:</strong> ' + data.result.confidence + '</div>';
    } else {
        throw new Error(data.error || '未知错误');
    }
}

/**
 * 显示错误信息
 * @param {HTMLElement} resultDiv - 结果显示区域
 * @param {Error} error - 错误对象
 */
function displayError(resultDiv, error) {
    resultDiv.className = 'error';
    resultDiv.innerHTML = '<h3>❌ 识别失败</h3><p>' + error.message + '</p>';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @return {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}