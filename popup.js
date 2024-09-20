document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getStatus"}, function(response) {
      if (response && response.status) {
        updateResultDisplay(response.status);
      }
    });
  });
});

function updateResultDisplay(status) {
  const resultDiv = document.getElementById('result');
  if (status === 'extracted') {
    resultDiv.textContent = '图片已提取,请使用页面上的下载按钮下载图片。';
  } else if (status === 'downloaded') {
    resultDiv.textContent = '图片已成功下载。';
  } else {
    resultDiv.textContent = '等待提取图片...';
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updatePopup") {
    updateResultDisplay(request.status);
  }
});