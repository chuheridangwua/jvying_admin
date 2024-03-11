self.onmessage = function(e) {
    // 从主线程接收数据
    const { action, data } = e.data;
  
    switch (action) {
      case 'PROCESS_DATA':
        // 执行耗时的数据处理任务...
        const processedData = processData(data);
        // 向主线程发送处理后的数据
        self.postMessage({ action: 'DATA_PROCESSED', processedData });
        break;
  
      default:
        // 发送错误或者忽略消息
        console.error('Unknown action: ' + action);
    }
  };
  
  function processData(data) {
    // 处理数据的函数
    // ...你的逻辑
    return data; // 返回处理后的数据
  }
  