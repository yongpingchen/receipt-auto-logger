// ============================================
// 🔄 page-switcher.js - 页面切换模块
// ============================================

/**
 * 页面切换器（命名空间模式）
 * 管理上传页面和确认页面之间的切换
 */
var PageSwitcher = (function() {
    
    // 页面 DOM 元素 ID
    var PAGE_IDS = {
        UPLOAD: 'uploadPage',
        CONFIRM: 'confirmPage'
    };
    
    /**
     * 显示上传页面
     */
    function showUploadPage() {
        var uploadPage = document.getElementById(PAGE_IDS.UPLOAD);
        var confirmPage = document.getElementById(PAGE_IDS.CONFIRM);
        
        if (!uploadPage || !confirmPage) {
            console.error('页面元素未找到');
            return;
        }
        
        uploadPage.style.display = 'block';
        confirmPage.style.display = 'none';
        
        // 清空结果显示区域
        var resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
            resultDiv.innerHTML = '';
        }
    }
    
    /**
     * 显示确认页面
     * @param {Object} data - 识别结果数据
     * @param {string} ocrText - 原始 OCR 文本
     */
    function showConfirmPage(data, ocrText) {
        var uploadPage = document.getElementById(PAGE_IDS.UPLOAD);
        var confirmPage = document.getElementById(PAGE_IDS.CONFIRM);
        
        if (!uploadPage || !confirmPage) {
            console.error('页面元素未找到');
            return;
        }
        
        // 验证数据
        if (!data || typeof data !== 'object') {
            console.error('无效的识别数据');
            return;
        }
        
        // 切换页面显示
        uploadPage.style.display = 'none';
        confirmPage.style.display = 'block';
        
        // 滚动到页面顶部
        window.scrollTo(0, 0);
        
        // 调用 ConfirmHandler 渲染数据
        if (typeof ConfirmHandler !== 'undefined' && ConfirmHandler.renderData) {
            ConfirmHandler.renderData(data, ocrText);
        } else {
            console.error('ConfirmHandler 未加载或缺少 renderData 方法');
        }
    }
    
    /**
     * 重置所有页面状态（用于清空表单等）
     */
    function resetAllPages() {
        showUploadPage();
        
        // 清空图片预览
        if (typeof ImageHandler !== 'undefined' && ImageHandler.clearCurrentFile) {
            ImageHandler.clearCurrentFile();
        }
        
        // 重置确认页面表单（如果已加载）
        if (typeof ConfirmHandler !== 'undefined' && ConfirmHandler.resetForm) {
            ConfirmHandler.resetForm();
        }
    }
    
    /**
     * 获取当前显示的页面
     * @return {string} 'upload' 或 'confirm'
     */
    function getCurrentPage() {
        var uploadPage = document.getElementById(PAGE_IDS.UPLOAD);
        var confirmPage = document.getElementById(PAGE_IDS.CONFIRM);
        
        if (uploadPage && uploadPage.style.display !== 'none') {
            return 'upload';
        }
        
        if (confirmPage && confirmPage.style.display !== 'none') {
            return 'confirm';
        }
        
        return 'unknown';
    }
    
    // 公开接口
    return {
        showUploadPage: showUploadPage,
        showConfirmPage: showConfirmPage,
        resetAllPages: resetAllPages,
        getCurrentPage: getCurrentPage
    };
    
})();
