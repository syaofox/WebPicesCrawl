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
  } else if (window.location.hostname.includes('jkforum.net')) {
    // 合并两种选择器的结果
    const selector1 = 'ignore_js_op > img';
    const selector2 = 'div.t_fsz td.t_f > img';
    const images1 = Array.from(document.querySelectorAll(selector1));
    const images2 = Array.from(document.querySelectorAll(selector2));
    images = [...images1, ...images2].map(img => img.src);
  } else if (window.location.hostname.includes('cool18.com')) {
    images = Array.from(document.querySelectorAll('td > pre > center > img')).map(img => img.getAttribute('mydatasrc') || img.src);
  } else if (window.location.hostname.includes('reprint-kh.com')) {
    images = Array.from(document.querySelectorAll('div.tiled-gallery-item a[data-image-id]')).map(a => {
      let src = a.href;
      // 如果是相对路径，转换为绝对路径
      if (src.startsWith('/')) {
        src = window.location.origin + src;
      } else if (!src.startsWith('http')) {
        src = new URL(src, window.location.href).href;
      }
      return src;
    });
  } else if (window.location.hostname.includes('1pondo.com')) {
    // 提取id为"macy"的元素中a标签的href属性
    const macyContainer = document.getElementById('macy');
    if (macyContainer) {
      images = Array.from(macyContainer.querySelectorAll('a')).map(a => a.href);
    }
  } else if (window.location.hostname.includes('mp.weixin.qq.com')) {

    const content = document.getElementById('js_content');
    if (content) {
      images = Array.from(content.querySelectorAll('img')).map(img => img.dataset.src || img.src);
    }
  } else if (window.location.hostname.includes('7h9u.com')) {
    // 7h9u.com网站的图片提取
    images = Array.from(document.querySelectorAll('#content_news > div > img')).map(img => {
      let src = img.src || img.dataset.src || img.getAttribute('data-src');
      // 如果是相对路径，转换为绝对路径
      if (src && src.startsWith('/')) {
        src = window.location.origin + src;
      } else if (src && !src.startsWith('http')) {
        src = new URL(src, window.location.href).href;
      }
      return src;
    }).filter(src => src && src.trim() !== ''); // 过滤掉空值
  }

  // 去重处理 - 使用智能去重逻辑
  const beforeDedupCount = images.length;
  images = deduplicateUrls(images);
  const duplicateCount = beforeDedupCount - images.length;
  
  if (duplicateCount > 0) {
    console.log(`发现 ${duplicateCount} 张重复图片，已过滤`);
  }

  return { urls: images, count: images.length, title: pageTitle };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 智能去重函数
function deduplicateUrls(urls) {
  const seen = new Set();
  const uniqueUrls = [];
  
  for (const url of urls) {
    try {
      // 标准化URL
      const normalizedUrl = normalizeImageUrl(url);
      
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        uniqueUrls.push(url); // 保留原始URL用于下载
      }
    } catch (error) {
      console.warn('URL标准化失败:', url, error);
      // 如果标准化失败，使用原始URL
      if (!seen.has(url)) {
        seen.add(url);
        uniqueUrls.push(url);
      }
    }
  }
  
  return uniqueUrls;
}

// URL标准化函数
function normalizeImageUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // 移除查询参数（除了可能影响图片的参数）
    const importantParams = ['w', 'h', 'width', 'height', 'size', 'quality'];
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of urlObj.searchParams) {
      if (importantParams.includes(key.toLowerCase())) {
        searchParams.set(key.toLowerCase(), value);
      }
    }
    
    // 移除锚点
    urlObj.hash = '';
    
    // 重建URL
    const normalizedUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    const queryString = searchParams.toString();
    
    return queryString ? `${normalizedUrl}?${queryString}` : normalizedUrl;
  } catch (error) {
    // 如果URL解析失败，返回原始URL
    return url;
  }
}

// 检查是否有下一页链接
function hasNextPage() {
  const nextPageLink = document.querySelector('a.next');
  return nextPageLink && nextPageLink.textContent.trim() === '下一页';
}

// 获取下一页链接
function getNextPageUrl() {
  const nextPageLink = document.querySelector('a.next');
  if (nextPageLink && nextPageLink.textContent.trim() === '下一页') {
    let href = nextPageLink.href;
    // 如果是相对路径，转换为绝对路径
    if (href.startsWith('/')) {
      href = window.location.origin + href;
    } else if (!href.startsWith('http')) {
      href = new URL(href, window.location.href).href;
    }
    return href;
  }
  return null;
}

// 7h9u.com多页图片提取
async function extractImagesFromAllPages() {
  let allImages = [];
  let pageCount = 0;
  
  // 记录开始时间
  extractionStartTime = Date.now();
  
  updateProgress('开始提取7h9u.com图片...');
  
  // 提取当前页面的图片
  const currentPageImages = Array.from(document.querySelectorAll('#content_news > div > img')).map(img => {
    let src = img.src || img.dataset.src || img.getAttribute('data-src');
    // 如果是相对路径，转换为绝对路径
    if (src && src.startsWith('/')) {
      src = window.location.origin + src;
    } else if (src && !src.startsWith('http')) {
      src = new URL(src, window.location.href).href;
    }
    return src;
  }).filter(src => src && src.trim() !== '');
  
  allImages = allImages.concat(currentPageImages);
  
  // 去重处理 - 使用智能去重逻辑
  const beforeDedupCount = allImages.length;
  allImages = deduplicateUrls(allImages);
  const duplicateCount = beforeDedupCount - allImages.length;
  
  if (duplicateCount > 0) {
    console.log(`第1页发现 ${duplicateCount} 张重复图片，已过滤`);
  }
  
  pageCount = 1;
  updateProgress(`第${pageCount}页提取完成，当前共${allImages.length}张图片`);
  
  // 检查是否有下一页
  if (!hasNextPage()) {
    updateProgress(`翻页结束，共提取${pageCount}页，总计${allImages.length}张图片`);
    return { urls: allImages, count: allImages.length, title: document.title, pageCount: pageCount };
  }
  
  // 获取下一页URL
  const nextPageUrl = getNextPageUrl();
  if (!nextPageUrl) {
    updateProgress('无法获取下一页链接，翻页结束');
    return { urls: allImages, count: allImages.length, title: document.title, pageCount: pageCount };
  }
  
  // 通过消息传递机制跳转到下一页，并传递已收集的图片
  updateProgress(`准备跳转到第${pageCount + 1}页...`);
  chrome.runtime.sendMessage({
    action: "navigateToNextPage", 
    url: nextPageUrl,
    collectedImages: allImages,
    pageCount: pageCount
  });
  
  // 返回当前页面的结果，下一页的提取将在新页面中继续
  return { urls: allImages, count: allImages.length, title: document.title, pageCount: pageCount, hasNext: true };
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
    } else if (window.location.hostname.includes('7h9u.com')) {
      // 7h9u.com使用多页提取功能
      extractImagesFromAllPages().then((result) => {
        console.log('提取的图片：', result);
        if (result.hasNext) {
          // 如果有下一页，不立即发送结果，等待多页提取完成
          updateProgress(`第${result.pageCount}页提取完成，准备跳转到下一页...`);
        } else {
          // 如果没有下一页，直接发送结果
          updateProgress(`提取完成，共提取 ${result.count} 张图片，共${result.pageCount}页`);
          chrome.runtime.sendMessage({action: "extract", data: result}, function(response) {
            console.log('收到背景脚本响应：', response);
            enableAllButtons();
          });
        }
      }).catch((error) => {
        console.error('提取图片时出错：', error);
        updateProgress('提取图片时出错：' + error.message);
        enableAllButtons();
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
  document.addEventListener('DOMContentLoaded', () => {
    createFloatingElement();
    // 检查是否需要恢复提取任务
    if (window.location.hostname.includes('7h9u.com')) {
      setTimeout(() => {
        checkForRecovery();
      }, 1000);
    }
  });
} else {
  createFloatingElement();
  // 检查是否需要恢复提取任务
  if (window.location.hostname.includes('7h9u.com')) {
    setTimeout(() => {
      checkForRecovery();
    }, 1000);
  }
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
    } else if (window.location.hostname.includes('7h9u.com')) {
      // 7h9u.com使用多页提取功能
      extractImagesFromAllPages().then((result) => {
        sendResponse(result);
        enableAllButtons();
      }).catch((error) => {
        console.error('提取图片时出错：', error);
        sendResponse({error: error.message});
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
    enableAllButtons();
  } else if (request.action === "pageNavigated") {
    // 处理页面跳转完成的消息
    updateProgress(`已跳转到第${request.pageCount + 1}页，继续提取图片...`);
    
    // 设置多页提取状态
    isMultiPageExtraction = true;
    collectedImagesFromAllPages = request.collectedImages || [];
    
    // 等待页面完全加载后继续提取
    setTimeout(() => {
      continueMultiPageExtraction(request.pageCount + 1);
    }, 1500);
  }
});

// 等待页面完全加载
async function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    
    const checkLoad = () => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        setTimeout(checkLoad, 50);
      }
    };
    checkLoad();
  });
}

// 检查页面是否有效
function isPageValid() {
  // 检查关键元素是否存在
  const contentNews = document.querySelector('#content_news');
  if (!contentNews) {
    console.log('页面无效：找不到#content_news元素');
    return false;
  }
  
  // 检查是否有图片元素
  const images = document.querySelectorAll('#content_news > div > img');
  if (images.length === 0) {
    console.log('页面无效：找不到图片元素');
    return false;
  }
  
  return true;
}

// 继续多页提取
async function continueMultiPageExtraction(currentPageCount) {
  if (!isMultiPageExtraction) return;
  
  try {
    updateProgress(`正在提取第${currentPageCount}页图片...`);
    console.log(`开始提取第${currentPageCount}页，当前URL: ${window.location.href}`);
    
    // 等待页面完全加载
    await waitForPageLoad();
    await sleep(1000); // 额外等待1秒确保图片加载
    
    // 检查页面是否有效
    if (!isPageValid()) {
      console.log(`第${currentPageCount}页无效，跳过`);
      updateProgress(`第${currentPageCount}页无效，尝试继续...`);
      
      // 尝试继续到下一页
      if (hasNextPage()) {
        const nextPageUrl = getNextPageUrl();
        if (nextPageUrl) {
          updateProgress(`跳过无效页面，准备跳转到第${currentPageCount + 1}页...`);
          chrome.runtime.sendMessage({
            action: "navigateToNextPage", 
            url: nextPageUrl,
            collectedImages: collectedImagesFromAllPages,
            pageCount: currentPageCount
          });
          return;
        }
      }
      
      // 如果没有下一页，结束提取
      updateProgress(`翻页结束，共提取${currentPageCount - 1}页，总计${collectedImagesFromAllPages.length}张图片`);
      finishMultiPageExtraction(currentPageCount - 1);
      return;
    }
    
    // 提取当前页面的图片
    const currentPageImages = Array.from(document.querySelectorAll('#content_news > div > img')).map(img => {
      let src = img.src || img.dataset.src || img.getAttribute('data-src');
      // 如果是相对路径，转换为绝对路径
      if (src && src.startsWith('/')) {
        src = window.location.origin + src;
      } else if (src && !src.startsWith('http')) {
        src = new URL(src, window.location.href).href;
      }
      return src;
    }).filter(src => src && src.trim() !== '');
    
    // 合并图片并去重
    collectedImagesFromAllPages = collectedImagesFromAllPages.concat(currentPageImages);
    
    // 去重处理 - 使用智能去重逻辑
    const beforeDedupCount = collectedImagesFromAllPages.length;
    collectedImagesFromAllPages = deduplicateUrls(collectedImagesFromAllPages);
    const duplicateCount = beforeDedupCount - collectedImagesFromAllPages.length;
    
    if (duplicateCount > 0) {
      console.log(`第${currentPageCount}页发现 ${duplicateCount} 张重复图片，已过滤`);
    }
    
    updateProgress(`第${currentPageCount}页提取完成，当前共${collectedImagesFromAllPages.length}张图片`);
    console.log(`第${currentPageCount}页提取完成，当前共${collectedImagesFromAllPages.length}张图片`);
    
    // 保存当前状态
    saveExtractionState(currentPageCount);
    lastSuccessfulPage = currentPageCount;
    
    // 检查是否有下一页
    if (!hasNextPage()) {
      updateProgress(`翻页结束，共提取${currentPageCount}页，总计${collectedImagesFromAllPages.length}张图片`);
      finishMultiPageExtraction(currentPageCount);
      return;
    }
    
    // 获取下一页URL
    const nextPageUrl = getNextPageUrl();
    if (!nextPageUrl) {
      updateProgress('无法获取下一页链接，翻页结束');
      finishMultiPageExtraction(currentPageCount);
      return;
    }
    
    // 跳转到下一页
    updateProgress(`准备跳转到第${currentPageCount + 1}页...`);
    chrome.runtime.sendMessage({
      action: "navigateToNextPage", 
      url: nextPageUrl,
      collectedImages: collectedImagesFromAllPages,
      pageCount: currentPageCount
    });
    
  } catch (error) {
    console.error(`第${currentPageCount}页提取出错:`, error);
    updateProgress(`第${currentPageCount}页提取出错: ${error.message}`);
    
    // 尝试继续到下一页
    if (hasNextPage()) {
      const nextPageUrl = getNextPageUrl();
      if (nextPageUrl) {
        updateProgress(`出错后尝试跳转到第${currentPageCount + 1}页...`);
        chrome.runtime.sendMessage({
          action: "navigateToNextPage", 
          url: nextPageUrl,
          collectedImages: collectedImagesFromAllPages,
          pageCount: currentPageCount
        });
        return;
      }
    }
    
    // 如果没有下一页，结束提取
    finishMultiPageExtraction(currentPageCount - 1);
  }
}

// 完成多页提取
function finishMultiPageExtraction(pageCount) {
  const finalResult = { 
    urls: collectedImagesFromAllPages, 
    count: collectedImagesFromAllPages.length, 
    title: document.title, 
    pageCount: pageCount 
  };
  
  chrome.runtime.sendMessage({action: "extract", data: finalResult}, function(response) {
    console.log('收到背景脚本响应：', response);
    enableAllButtons();
  });
  
  // 重置状态
  isMultiPageExtraction = false;
  collectedImagesFromAllPages = [];
  extractionStartTime = null;
  lastSuccessfulPage = 0;
  
  // 清除保存的状态
  clearExtractionState();
}

// 全局变量存储7h9u.com多页提取的状态
let collectedImagesFromAllPages = [];
let isMultiPageExtraction = false;
let extractionStartTime = null;
let lastSuccessfulPage = 0;

// 检查是否需要恢复提取
function checkForRecovery() {
  // 检查是否有未完成的提取任务
  const savedState = localStorage.getItem('7h9u_extraction_state');
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      const timeDiff = Date.now() - state.timestamp;
      
      // 如果保存的状态在30分钟内，自动恢复
      if (timeDiff < 30 * 60 * 1000) {
        console.log(`自动恢复提取任务：${state.pageCount}页，${state.imageCount}张图片`);
        
        collectedImagesFromAllPages = state.collectedImages || [];
        isMultiPageExtraction = true;
        lastSuccessfulPage = state.pageCount;
        updateProgress(`自动恢复提取任务，从第${state.pageCount + 1}页继续...`);
        
        // 等待页面加载后继续
        setTimeout(() => {
          continueMultiPageExtraction(state.pageCount + 1);
        }, 1000);
        
        return true;
      } else {
        // 清除过期的状态
        console.log('清除过期的提取状态');
        localStorage.removeItem('7h9u_extraction_state');
      }
    } catch (error) {
      console.error('恢复状态失败:', error);
      localStorage.removeItem('7h9u_extraction_state');
    }
  }
  return false;
}

// 保存提取状态
function saveExtractionState(pageCount) {
  const state = {
    timestamp: Date.now(),
    pageCount: pageCount,
    imageCount: collectedImagesFromAllPages.length,
    collectedImages: collectedImagesFromAllPages,
    url: window.location.href
  };
  localStorage.setItem('7h9u_extraction_state', JSON.stringify(state));
}

// 清除提取状态
function clearExtractionState() {
  localStorage.removeItem('7h9u_extraction_state');
}

console.log('content.js 已加载');
