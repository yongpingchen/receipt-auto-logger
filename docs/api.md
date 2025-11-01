# 📡 API 文档

## Web App 接口

### POST /exec

**请求**:
```json
{
  "token": "your_token",
  "image_base64": "base64_string"
}
```

**响应**:
```json
{
  "success": true,
  "result": {
    "date": "2025-11-01",
    "amount": 1250,
    "store": "店名",
    "taxRate": "10%",
    "hasTNumber": "有"
  }
}
```

---

**更新日期**: 2025-11-01
