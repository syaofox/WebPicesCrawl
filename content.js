function extractImages() {
  let images = [];
  let pageTitle = document.title;

  if (window.location.hostname.includes('photos18.com')) {
    images = Array.from(document.querySelectorAll('#content .imgHolder img')).map(img => img.src);
  } else if (window.location.hostname.includes('knit.bid')) {
    images = Array.from(document.querySelectorAll('.article-content .item-image img')).map(img => {
      let src = img.dataset.src || img.src;
      // 如果是相对路径，转换为绝对路径
      if (src.startsWith('/')) {
        src = window.location.origin + src;
      } else if (!src.startsWith('http')) {
        // 如果不是以http开头，也不是以/开头，可能是相对于当前页面的路径
        src = new URL(src, window.location.href).href;
      }
      return src;
    });
  } else if (window.location.hostname.includes('xinmeitulu.com')) {
    images = Array.from(document.querySelectorAll('body > div:nth-child(7) > div > figure > a > img')).map(img => img.src);
  } else if (window.location.hostname.includes('japanesethumbs.com')) {
    const urlPath = window.location.pathname.split('/').filter(Boolean);
    if (urlPath.length >= 2) {
      const urlPrefix = `/${urlPath[0]}/${urlPath[1]}`;
      images = Array.from(document.querySelectorAll('a')).filter(a => {
        // 检查 a 标签的 href 属性
        const hrefValid = a.href.includes(urlPrefix) && /\.(jpg|jpeg|png|gif|webp)$/i.test(a.href);
        
        // 检查 a 标签下是否有 img 子标签,且 img 的 src 属性也包含相同的 URL 前缀
        const imgValid = a.querySelector('img[src*="' + urlPrefix + '"]') !== null;
        
        return hrefValid && imgValid;
      }).map(a => a.href);
    }
  }

  return { urls: images, count: images.length, title: pageTitle };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollAndLoadImages() {
  const scrollStep = window.innerHeight - 100; // 每次滚动一个屏幕高度减去100像素
  const scrollInterval = 200; // 每200毫秒滚动一次
  let loadedImages = 0;

  // 滚动到页面顶部
  window.scrollTo(0, 0);
  await sleep(1000); // 等待1秒,确保页面已滚动到顶部
  console.log('已滚动到页面顶部');
  updateProgress('开始加载图片...');

  window.scrollBy(0, scrollStep);
  await sleep(1000);

  while (true) { 

    // 检查屏幕范围内是否存在加载中的图片
    const loadingImages = Array.from(document.querySelectorAll('img[src$="static/zde/timg.gif"]'))
      .filter(img => {
        const rect = img.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });

    if (loadingImages.length === 0) {
      // 如果屏幕范围内没有加载中的图片，则进行最大限度的滚动
      window.scrollBy(0, scrollStep);
      await sleep(scrollInterval);
    } else {
      // 如果存在加载中的图片，等待它们加载完成
      console.log('检测到加载中的图片，等待其消失');
      let waitTime = 0;
      const maxWaitTime = 5000; // 最大等待时间为5秒
      while (document.querySelectorAll('img[src$="static/zde/timg.gif"]').length > 0 && waitTime < maxWaitTime) {
        await sleep(200);
        waitTime += 200;
      }
      if (waitTime >= maxWaitTime) {
        console.log('等待加载中的图片超时，继续执行');
      } else {
        console.log('所有加载中的图片已消失');
      }
    }

  // 检测屏幕可见范围内是否有.pagination-loading
  const paginationLoading = Array.from(document.querySelectorAll('.pagination-loading')).find(element => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });

  if (paginationLoading) {
    console.log('检测到屏幕可见范围内有加载中的图片，等待其消失');
    let waitTime = 0;
    const maxWaitTime = 5000; // 最大等待时间为5秒
    while (Array.from(document.querySelectorAll('.pagination-loading')).some(element => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }) && waitTime < maxWaitTime) {
      await sleep(200);
      waitTime += 200;
    } 
    if (waitTime >= maxWaitTime) {
      console.log('等待加载中的图片超时，继续执行');
    } else {
      console.log('屏幕可见范围内所有加载中的图片已消失');
    }
  }

   // 检查当前屏幕范围内是否存在 "Click to continue loading" 按钮
  const loadMoreButton = Array.from(document.querySelectorAll('.ias_trigger a')).find(button => {
    const rect = button.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  if (loadMoreButton) {
    loadMoreButton.click();
    console.log('点击了屏幕范围内的加载更多按钮');
    await sleep(500); 

    // 等待 Loading... 消失，设置最长等待时间为10秒
    let waitTime = 0;
    const maxWaitTime = 10000; // 10秒
    while (document.querySelector('.pagination-loading') && waitTime < maxWaitTime) {
      await sleep(200);
      waitTime += 200;
    }
    if (waitTime >= maxWaitTime) {
      console.log('等待加载更多内容超时，继续执行');
    } else {
      console.log('加载更多内容完成');
    }
  }


    // 更新已加载的图片数量
    const currentImages = document.querySelectorAll('.article-content .item-image img').length;
    if (currentImages > loadedImages) {
      loadedImages = currentImages;
      updateProgress(`正在加载图片... 已加载 ${loadedImages} 张`);
    }

    // 检查是否已经到达页面底部
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      await sleep(2000);
      break;
    }
  }

  updateProgress(`图片加载完成，共加载 ${loadedImages} 张图片`);
}

function createFloatingElement() {
  if (document.getElementById('image-extractor-floating')) {
    return;
  }

  console.log('创建浮动元素');

  const floatingDiv = document.createElement('div');
  floatingDiv.id = 'image-extractor-floating';
  floatingDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #f0f0f0;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 9999;
  `;

  const extractButton = document.createElement('button');
  extractButton.id = 'extract-button';
  extractButton.textContent = '提取图片';
  extractButton.onclick = function() {
    console.log('提取图片按钮被点击');
    disableButton(extractButton);
    if (window.location.hostname.includes('knit.bid')) {
      scrollAndLoadImages().then(() => {
        const result = extractImages();
        console.log('提取的图片：', result);
        updateProgress(`提取完成，共提取 ${result.count} 张图片`);
        chrome.runtime.sendMessage({action: "extract", data: result}, function(response) {
          console.log('收到背景脚本响应：', response);
          enableAllButtons();
        });
      });
    } else {
      const result = extractImages();
      console.log('提取的图片：', result);
      updateProgress(`提取完成，共提取 ${result.count} 张图片`);
      chrome.runtime.sendMessage({action: "extract", data: result}, function(response) {
        console.log('收到背景脚本响应：', response);
        enableAllButtons();
      });
    }
  };


  const progressDiv = document.createElement('div');
  progressDiv.id = 'image-extractor-progress';
  progressDiv.style.marginTop = '10px';

  floatingDiv.appendChild(extractButton);

  floatingDiv.appendChild(progressDiv);
  document.body.appendChild(floatingDiv);

  console.log('浮动元素已创建并添加到页面');


}

function disableButton(button) {
  button.disabled = true;
  button.style.opacity = '0.5';
  button.style.cursor = 'not-allowed';
}

function enableButton(button) {
  button.disabled = false;
  button.style.opacity = '1';
  button.style.cursor = 'pointer';
}

function enableAllButtons() {
  const extractButton = document.getElementById('extract-button');
  enableButton(extractButton);
}

function updateProgress(message) {
  const progressDiv = document.getElementById('image-extractor-progress');
  if (progressDiv) {
    progressDiv.textContent = message;
  }
}

// 确保在 DOM 加载完成后创建浮动元素
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingElement);
} else {
  createFloatingElement();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extract") {
    if (window.location.hostname.includes('knit.bid')) {
      scrollAndLoadImages().then(() => {
        const result = extractImages();
        sendResponse(result);
        enableAllButtons();
      });
      return true; // 保持消息通道开放
    } else {
      const result = extractImages();
      sendResponse(result);
      enableAllButtons();
    }
  } else if (request.action === "downloadComplete") {
    updateProgress(`下载完成，共下载 ${request.count} 张图片`);
    enableButton(document.getElementById('download-button'));
  }
});

console.log('content.js 已加载');

