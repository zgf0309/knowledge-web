// 选择文件的工具函数
export const selectFile = (accept: string): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      resolve(file || null);
    };
    input.click();
  });
};

// 模拟文件上传，实际项目中应替换为真实的上传接口
export const uploadFile = async (file: File): Promise<string> => {
  // 这里目前使用 createObjectURL 生成本地预览地址
  // 如果有后端上传接口，这里应该执行 POST 请求，并返回服务器上的 URL
  return new Promise((resolve) => {
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      resolve(url);
    }, 500); // 模拟网络延迟
  });
};
