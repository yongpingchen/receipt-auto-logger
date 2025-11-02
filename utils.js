// 工具函数
function validateFile(file) {
    if (APP_CONFIG.BLOCKED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
        throw new Error('不支持 HEIC 格式');
    }
    if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
    }
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        throw new Error('图片太大');
    }
    return true;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function sendRequest(apiUrl, token, base64Image) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT);
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({ token: token, image_base64: base64Image }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function displayResult(resultDiv, data) {
    if (data.success) {
        resultDiv.className = 'success';
        resultDiv.innerHTML = `
            <h3>✅ 识别成功</h3>
            <div class="result-item"><strong>日期:</strong> ${data.result.date}</div>
            <div class="result-item"><strong>金额:</strong> ¥${data.result.amount}</div>
            <div class="result-item"><strong>店名:</strong> ${data.result.store}</div>
            <div class="result-item"><strong>置信度:</strong> ${data.result.confidence}</div>
        `;
    } else {
        throw new Error(data.error || '未知错误');
    }
}

function displayError(resultDiv, error) {
    resultDiv.className = 'error';
    resultDiv.innerHTML = `<h3>❌ 识别失败</h3><p>${error.message}</p>`;
}
