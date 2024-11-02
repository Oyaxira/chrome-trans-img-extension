// 存储已打开的翻译窗口ID
let translationWindowId = null;

// 在扩展安装或浏览器启动时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translateImage",
        title: "翻译图片",
        contexts: ["image"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "translateImage") {
        const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(info.srcUrl)}`;

        // 检查窗口是否已存在
        if (translationWindowId !== null) {
            try {
                // 尝试获取窗口信息
                const window = await chrome.windows.get(translationWindowId);
                // 如果窗口存在，更新URL
                await chrome.windows.update(translationWindowId, {
                    focused: true,
                    width: 1600,
                    height: 900
                });
                // 获取窗口中的标签页并更新URL
                const tabs = await chrome.tabs.query({ windowId: translationWindowId });
                await chrome.tabs.update(tabs[0].id, { url: googleLensUrl });
            } catch (e) {
                // 如果窗口不存在（可能已被关闭），创建新窗口
                translationWindowId = null;
            }
        }

        // 如果没有已存在的窗口，创建新窗口
        if (translationWindowId === null) {
            const window = await chrome.windows.create({
                url: googleLensUrl,
                type: 'popup',
                width: 1600,
                height: 900
            });
            translationWindowId = window.id;
        }
    }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === translationWindowId) {
        translationWindowId = null;
    }
});
