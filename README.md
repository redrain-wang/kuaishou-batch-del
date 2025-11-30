# Kuaishou Console Bulk Delete 扩展

## 功能简介
本扩展支持快手后台视频列表和合集页面的批量操作，提供“全选”和“批量删除”按钮，方便一键管理视频。

## 安装方法
1. 克隆或下载本仓库。
2. 打开 Chrome 浏览器，访问 `chrome://extensions`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本项目中的 `chrome-extension` 文件夹。

## 使用方法
- 进入快手后台视频管理页面（如 `https://cp.kuaishou.com/article/manage/video`），或合集页面（如 `https://cp.kuaishou.com/article/publish/collection`）。
- 页面顶部会自动出现“全选”和“批量删除”按钮。
- 点击“全选”可选中所有视频。
- 点击“批量删除”可一键删除所有已选中的视频。

## 注意事项
- 删除操作不可撤销，请谨慎使用。
- 删除请求会使用当前登录的快手后台账号。
- 如果部分视频无法删除，请确认 ID 是否正确（部分视频可能带有特殊后缀，扩展已自动处理常见情况）。

## 作者信息
- 作者：redrain
- 联系方式：wangredrain@gmail.com

## 许可
仅供学习和个人使用，禁止用于非法用途。
