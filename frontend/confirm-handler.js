// ============================================
// ✅ confirm-handler.js - 确认页面处理模块
// ============================================

/**
 * 确认页面处理器（命名空间模式）
 * 负责渲染识别结果、验证表单、提交到 Sheet
 */
var ConfirmHandler = (function() {
    
    // 私有变量：保存原始数据
    var currentOcrText = '';      // 原始 OCR 文本
    var currentConfidence = 0;    // 置信度
    
    /**
     * 渲染识别结果到表单
     * @param {Object} data - 识别结果数据
     * @param {string} ocrText - 原始 OCR 文本
     */
    function renderData(data, ocrText) {
        // 保存原始数据
        currentOcrText = ocrText || '';
        currentConfidence = parseInt(data.confidence, 10) || 0;
        
        // 填充表单字段
        var dateInput = document.getElementById('confirmDate');
        var amountInput = document.getElementById('confirmAmount');
        var storeInput = document.getElementById('confirmStore');
        var taxRateSelect = document.getElementById('confirmTaxRate');
        var hasTNumberSelect = document.getElementById('confirmHasTNumber');
        var confidenceBadge = document.getElementById('confirmConfidence');
        
        // 验证元素是否存在
        if (!dateInput || !amountInput || !storeInput || !taxRateSelect || !hasTNumberSelect) {
            console.error('确认页面表单元素缺失');
            alert('页面加载错误，请刷新重试');
            return;
        }
        
        // 填充日期（转换为 YYYY-MM-DD 格式）
        if (data.date) {
            dateInput.value = data.date;
        }
        
        // 填充金额
        if (data.amount !== undefined && data.amount !== null) {
            amountInput.value = data.amount;
        }
        
        // 填充店名
        if (data.store) {
            storeInput.value = data.store;
        }
        
        // 填充税率
        if (data.taxRate) {
            taxRateSelect.value = data.taxRate;
        }
        
        // 填充 T 番号
        if (data.hasTNumber) {
            hasTNumberSelect.value = data.hasTNumber;
        }
        
        // 显示置信度
        if (confidenceBadge) {
            confidenceBadge.textContent = data.confidence || '0%';
            
            // 根据置信度设置颜色
            var confidenceNum = parseInt(data.confidence, 10) || 0;
            if (confidenceNum >= 85) {
                confidenceBadge.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            } else if (confidenceNum >= 60) {
                confidenceBadge.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
            } else {
                confidenceBadge.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            }
        }
        
        // 清空之前的结果显示
        var confirmResult = document.getElementById('confirmResult');
        if (confirmResult) {
            confirmResult.style.display = 'none';
            confirmResult.innerHTML = '';
        }
    }
    
    /**
     * 验证表单数据
     * @param {Object} formData - 表单数据
     * @return {boolean} 验证是否通过
     */
    function validateForm(formData) {
        // 验证日期格式 (YYYY-MM-DD)
        var datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!formData.date || !datePattern.test(formData.date)) {
            alert('请输入有效的日期');
            return false;
        }
        
        // 验证金额
        if (!formData.amount || formData.amount <= 0) {
            alert('请输入有效的金额（大于 0）');
            return false;
        }
        
        if (formData.amount >= 1000000) {
            alert('金额过大（超过 100 万円），请检查');
            return false;
        }
        
        // 验证店名
        if (!formData.store || formData.store.trim().length === 0) {
            alert('请输入店名');
            return false;
        }
        
        if (formData.store.length > 50) {
            alert('店名过长（最多 50 字）');
            return false;
        }
        
        // 验证税率
        if (formData.taxRate !== '10%' && formData.taxRate !== '8%') {
            alert('税率只能是 10% 或 8%');
            return false;
        }
        
        // 验证 T 番号（可选字段）
        if (formData.hasTNumber && formData.hasTNumber.trim() !== '') {
            var tNumberPattern = /^T\d{13}$/;
            if (!tNumberPattern.test(formData.hasTNumber.trim())) {
                alert('T 番号格式错误\n正确格式：T + 13位数字（例如 T1234567890123）');
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 提交数据到 Sheet
     */
    function submitToSheet() {
        // 获取表单数据
        var dateInput = document.getElementById('confirmDate');
        var amountInput = document.getElementById('confirmAmount');
        var storeInput = document.getElementById('confirmStore');
        var taxRateSelect = document.getElementById('confirmTaxRate');
        var hasTNumberSelect = document.getElementById('confirmHasTNumber');
        
        var formData = {
            date: dateInput.value,
            amount: parseInt(amountInput.value, 10),
            store: storeInput.value.trim(),
            taxRate: taxRateSelect.value,
            hasTNumber: hasTNumberSelect.value,
            ocrText: currentOcrText,
            confidence: currentConfidence
        };
        
        // 验证表单
        if (!validateForm(formData)) {
            return;
        }
        
        // 显示加载状态
        var confirmResult = document.getElementById('confirmResult');
        if (confirmResult) {
            confirmResult.style.display = 'block';
            confirmResult.className = '';
            confirmResult.innerHTML = 
                '<div class="loading">' +
                '<div class="spinner"></div>' +
                '<p>正在提交到 Sheet...</p>' +
                '</div>';
        }
        
        // 禁用提交按钮，防止重复提交
        disableSubmitButton();
        
        // 发送提交请求
        sendSubmitRequest(formData)
            .then(function(result) {
                // 提交成功
                if (confirmResult) {
                    confirmResult.className = 'success';
                    confirmResult.innerHTML = 
                        '<h3>✅ 提交成功</h3>' +
                        '<p>数据已成功写入 Google Sheet</p>';
                }
                
                // 3 秒后返回上传页面
                setTimeout(function() {
                    PageSwitcher.resetAllPages();
                }, 3000);
            })
            .catch(function(error) {
                // 提交失败
                if (confirmResult) {
                    confirmResult.className = 'error';
                    confirmResult.innerHTML = 
                        '<h3>❌ 提交失败</h3>' +
                        '<p>' + error.message + '</p>' +
                        '<p>请检查网络连接或稍后重试</p>';
                }
                
                // 重新启用提交按钮
                enableSubmitButton();
            });
    }
    
    /**
     * 发送提交请求到后端
     * @param {Object} formData - 表单数据
     * @return {Promise<Object>} API 响应
     */
    function sendSubmitRequest(formData) {
        return new Promise(function(resolve, reject) {
            var apiUrl = document.getElementById('apiUrl').value;
            var token = document.getElementById('token').value;
            
            if (!apiUrl) {
                reject(new Error('缺少 API URL'));
                return;
            }
            
            var xhr = new XMLHttpRequest();
            var timeoutId = setTimeout(function() {
                xhr.abort();
                reject(new Error('请求超时（30秒）'));
            }, APP_CONFIG.REQUEST_TIMEOUT);
            
            xhr.open('POST', apiUrl, true);
            xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
            
            xhr.onload = function() {
                clearTimeout(timeoutId);
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            resolve(response);
                        } else {
                            reject(new Error(response.error || '提交失败'));
                        }
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
            
            // 发送 submit 请求
            xhr.send(JSON.stringify({
                action: 'submit',
                token: token,
                data: formData
            }));
        });
    }
    
    /**
     * 禁用提交按钮
     */
    function disableSubmitButton() {
        var buttons = document.querySelectorAll('#confirmPage button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }
    
    /**
     * 启用提交按钮
     */
    function enableSubmitButton() {
        var buttons = document.querySelectorAll('#confirmPage button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }
    }
    
    /**
     * 重置表单
     */
    function resetForm() {
        currentOcrText = '';
        currentConfidence = 0;
        
        var form = document.getElementById('confirmForm');
        if (form) {
            form.reset();
        }
        
        var confirmResult = document.getElementById('confirmResult');
        if (confirmResult) {
            confirmResult.style.display = 'none';
            confirmResult.innerHTML = '';
        }
    }
    
    // 公开接口
    return {
        renderData: renderData,
        submitToSheet: submitToSheet,
        resetForm: resetForm
    };
    
})();
