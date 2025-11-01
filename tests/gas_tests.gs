/**
 * 测试套件
 */
function testAll() {
  Logger.clear();
  Logger.log('========== 开始测试 ==========');
  
  testConfig();
  testVisionAPI();
  testParser();
  testSheetWriter();
  
  Logger.log('========== 测试完成 ==========');
}

function testConfig() {
  Logger.log('测试配置...');
  // TODO: 添加测试
}

function testVisionAPI() {
  Logger.log('测试 Vision API...');
  // TODO: 添加测试
}

function testParser() {
  Logger.log('测试解析器...');
  // TODO: 添加测试
}

function testSheetWriter() {
  Logger.log('测试 Sheet 写入...');
  // TODO: 添加测试
}
