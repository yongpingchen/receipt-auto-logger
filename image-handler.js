// ============================================
// 📷 image-handler.js - 图片处理模块
// ============================================

/**
 * 图片处理器（命名空间模式）
 */
var ImageHandler = (function() {
    
    // 私有变量：当前选择的文件
    var currentFile = null;
    
    /**
     * 从相册选择照片
     */
    function selectFromGallery() {
        var input = document.getElementById('galleryFile');
        input.onchange = handleFileSelect;
        input.click();
    }
    
    /**
     * 拍照
     */
    function takePhoto() {
        var input = document.getElementById('cameraFile');
        input.onchange = handlePhotoCapture;
        input.click();
    }
    
    /**
     * 处理从相册选择的文件
     * @param {Event} event - 文件选择事件
     */
    function handleFileSelect(event) {
        var file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    }
    
    /**
     * 处理拍照的文件
     * @param {Event} event - 文件选择事件
     */
    function handlePhotoCapture(event) {
        var file = event.target.files[0];
        if (file) {
            // 触发保存到设备
            savePhotoToDevice(file);
            processFile(file);
        }
    }
    
    /**
     * 保存照片到设备（触发下载）
     * @param {File} file - 文件对象
     */
    function savePhotoToDevice(file) {
        // 创建临时下载链接
        var url = URL.createObjectURL(file);
        var a = document.createElement('a');
        
        // 生成带时间戳的文件名
        var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.href = url;
        a.download = 'receipt_' + timestamp + '.jpg';
        
        // 触发下载（移动设备会提示保存）
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理 URL 对象
        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * 处理文件（验证、预览、启用按钮）
     * @param {File} file - 文件对象
     */
    function processFile(file) {
        try {
            validateFile(file);
            currentFile = file;
            showImagePreview(file);
            document.getElementById('uploadBtn').disabled = false;
        } catch (error) {
            alert(error.message);
            currentFile = null;
            document.getElementById('uploadBtn').disabled = true;
        }
    }
    
    /**
     * 显示图片预览
     * @param {File} file - 文件对象
     */
    function showImagePreview(file) {
        var preview = document.getElementById('imagePreview');
        var reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = 
                '<img src="' + e.target.result + '" alt="预览">' +
                '<div class="filename">📎 ' + file.name + ' (' + formatFileSize(file.size) + ')</div>';
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * 获取当前选择的文件
     * @return {File|null} 当前文件
     */
    function getCurrentFile() {
        return currentFile;
    }
    
    /**
     * 清除当前文件
     */
    function clearCurrentFile() {
        currentFile = null;
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('uploadBtn').disabled = true;
    }
    
    // 公开接口
    return {
        selectFromGallery: selectFromGallery,
        takePhoto: takePhoto,
        getCurrentFile: getCurrentFile,
        clearCurrentFile: clearCurrentFile
    };
    
})();