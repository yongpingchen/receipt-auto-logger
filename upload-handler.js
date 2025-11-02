// ============================================
// 🚀 upload-handler.js - 上传处理模块
// ============================================

/**
 * 上传处理器（命名空间模式）
 */
var UploadHandler = (function() {
    
    /**
     * 上传收据主函数
     */
    function uploadReceipt() {
        var apiUrl = document.getElementById('apiUrl').value;
        var token = document.getElementById('token').value;
        var resultDiv = document.getElementById('result');
        var currentFile = ImageHandler.getCurrentFile();
        
        // 验证输入
        if (!apiUrl) {
            alert('请输入 Web App URL');
            return;
        }
        
        if (!currentFile) {
            alert('请先选择或拍摄一张收据照片');
            return;
        }
        
        // 显示加载状态
        showLoading(resultDiv);
        
        // 执行上传流程
        fileToBase64(currentFile)
            .then(function(base64) {
                var pureBase64 = base64.split(',')[1];
                return sendRequest(apiUrl, token, pureBase64);
            })
            .then(function(data) {
                displayResult(resultDiv, data);
            })
            .catch(function(error) {
                displayError(resultDiv, error);
            });
    }
    
    /**
     * 显示加载状态
     * @param {HTMLElement} resultDiv - 结果显示区域
     */
    function showLoading(resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.className = '';
        resultDiv.innerHTML = 
            '<div class="loading">' +
            '<div class="spinner"></div>' +
            '<p>正在识别中...</p>' +
            '</div>';
    }
    
    // 公开接口
    return {
        uploadReceipt: uploadReceipt
    };
    
})();