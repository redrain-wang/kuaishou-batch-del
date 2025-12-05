(() => {
  // ========== 视频管理页面逻辑 ==========
  function insertCheckboxesVideo() {
    const rows = document.querySelectorAll('.video-item');
    rows.forEach((el) => {
      const cover = el.querySelector('.video-item__cover');
      if (cover && cover.parentNode) {
        if (cover.parentNode.querySelector('.ks-bulk-checkbox-wrapper')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'ks-bulk-checkbox-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.marginRight = '20px';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ks-bulk-checkbox';
        checkbox.style.position = 'absolute';
        checkbox.style.left = '0px';
        checkbox.style.top = '0px';
        checkbox.style.zIndex = '10';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        checkbox.style.background = '#fff';
        wrapper.appendChild(checkbox);
        cover.parentNode.insertBefore(wrapper, cover);
      }
    });
  }

  function insertControlsVideo() {
    const old = document.getElementById('ks-bulk-controls');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const container = document.createElement('div');
    container.id = 'ks-bulk-controls';
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.margin = '12px 0';

    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = '全选';
    selectAllBtn.style.fontWeight = 'bold';
    selectAllBtn.style.background = '#f33';
    selectAllBtn.style.color = '#fff';
    selectAllBtn.style.border = 'none';
    selectAllBtn.style.padding = '8px 16px';
    selectAllBtn.style.borderRadius = '4px';
    selectAllBtn.onclick = selectAllVideo;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '批量删除';
    deleteBtn.style.fontWeight = 'bold';
    deleteBtn.style.background = '#333';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '8px 16px';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.onclick = bulkDeleteVideo;

    container.appendChild(selectAllBtn);
    container.appendChild(deleteBtn);

    const statusDiv = document.querySelector('.works-manage__status');
    if (statusDiv && statusDiv.parentNode) {
      statusDiv.parentNode.insertBefore(container, statusDiv.nextSibling);
    }
  }

  function getItemsVideo() {
    const items = [];
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      let el = wrapper;
      while (el && !el.classList.contains('video-item')) {
        el = el.parentElement;
      }
      let pid = null;
      if (el) {
        const img = el.querySelector('img[src*="clientCacheKey="]');
        if (img) {
          const m = img.src.match(/clientCacheKey=([a-zA-Z0-9_-]{10,32})\.jpg/);
          if (m) pid = m[1];
        }
      }
      if (pid) {
        pid = pid.replace(/_[^_]+$/, '');
      }
      if (el && pid && checkbox) {
        items.push({ el, pid, checkbox });
      }
    });
    return items;
  }

  function selectAllVideo() {
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    let count = 0;
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      if (checkbox) {
        checkbox.checked = true;
        count++;
      }
    });
    const items = getItemsVideo();
    items.forEach(({ el }) => {
      el.style.outline = '2px solid #f33';
      el.setAttribute('data-selected', 'true');
    });
    alert(`Selected ${count} items`);
  }

  async function bulkDeleteVideo() {
    const items = getItemsVideo().filter(({ checkbox }) => checkbox && checkbox.checked);
    if (items.length === 0) {
      alert('No items selected');
      return;
    }
    if (!confirm(`Delete ${items.length} selected items? This cannot be undone.`)) return;

    let ok = 0;
    for (let i = 0; i < items.length; i++) {
      const { pid } = items[i];
      try {
        const url = new URL('https://cp.kuaishou.com/rest/cp/works/v2/video/pc/delete');
        const resp = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
          body: JSON.stringify({ photoId: pid })
        });
        if (resp.ok) {
          ok++;
        }
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        console.warn('Delete error for', pid, e);
      }
    }
    alert(`Deleted ${ok}/${items.length} items. Refresh the page to see changes.`);
  }

  function runInitVideo() {
    insertControlsVideo();
    insertCheckboxesVideo();
  }

  // ========== 合集页面逻辑 ==========
  function insertCheckboxesCollection() {
    const rows = document.querySelectorAll('.selected-list-item');
    rows.forEach((el) => {
      const cover = el.querySelector('.selected-list-item__cover');
      if (cover && cover.parentNode) {
        if (cover.parentNode.querySelector('.ks-bulk-checkbox-wrapper-collection')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'ks-bulk-checkbox-wrapper-collection';
        wrapper.style.position = 'relative';
        wrapper.style.marginRight = '10px';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ks-bulk-checkbox-collection';
        checkbox.style.zIndex = '10';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        checkbox.style.background = '#fff';
        wrapper.appendChild(checkbox);
        cover.parentNode.insertBefore(wrapper, cover);
      }
    });
  }

  function insertControlsCollection() {
    if (document.getElementById('ks-bulk-controls-collection')) return;

    const container = document.createElement('div');
    container.id = 'ks-bulk-controls-collection';
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.margin = '12px 0';

    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = '全选';
    selectAllBtn.style.fontWeight = 'bold';
    selectAllBtn.style.background = '#f33';
    selectAllBtn.style.color = '#fff';
    selectAllBtn.style.border = 'none';
    selectAllBtn.style.padding = '8px 16px';
    selectAllBtn.style.borderRadius = '4px';
    selectAllBtn.onclick = selectAllCollection;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '批量删除';
    deleteBtn.style.fontWeight = 'bold';
    deleteBtn.style.background = '#333';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '8px 16px';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.onclick = bulkDeleteCollection;

    container.appendChild(selectAllBtn);
    container.appendChild(deleteBtn);

    const topNode = document.querySelector('.selected-list-item');
    if (topNode && topNode.parentNode) {
      topNode.parentNode.insertBefore(container, topNode);
    }
  }

  function getItemsCollection() {
    const items = [];
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper-collection');
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox-collection');
      let el = wrapper;
      while (el && !el.classList.contains('selected-list-item')) {
        el = el.parentElement;
      }
      let pid = null;
      if (el) {
        const img = el.querySelector('img[src*="clientCacheKey="]');
        if (img) {
          const m = img.src.match(/clientCacheKey=([a-zA-Z0-9_-]{10,32})\.jpg/);
          if (m) pid = m[1];
        }
      }
      if (pid) {
        pid = pid.replace(/_[^_]+$/, '');
      }
      if (el && pid && checkbox) {
        items.push({ el, pid, checkbox });
      }
    });
    return items;
  }

  function selectAllCollection() {
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper-collection');
    let count = 0;
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox-collection');
      if (checkbox) {
        checkbox.checked = true;
        count++;
      }
    });
    const items = getItemsCollection();
    items.forEach(({ el }) => {
      el.style.outline = '2px solid #f33';
      el.setAttribute('data-selected', 'true');
    });
    alert(`Selected ${count} items`);
  }

  async function bulkDeleteCollection() {
    const items = getItemsCollection().filter(({ checkbox }) => checkbox && checkbox.checked);
    if (items.length === 0) {
      alert('No items selected');
      return;
    }
    if (!confirm(`Delete ${items.length} selected items? This cannot be undone.`)) return;

    let ok = 0;
    for (let i = 0; i < items.length; i++) {
      const { pid } = items[i];
      try {
        const url = new URL('https://cp.kuaishou.com/rest/cp/works/v2/video/pc/delete');
        const resp = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
          body: JSON.stringify({ photoId: pid })
        });
        if (resp.ok) {
          ok++;
        }
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        console.warn('Delete error for', pid, e);
      }
    }
    alert(`Deleted ${ok}/${items.length} items. Refresh the page to see changes.`);
  }

  function runInitCollection() {
    insertControlsCollection();
    insertCheckboxesCollection();
  }

  // ========== 清理旧控件（仅在页面类型切换时调用） ==========
  function cleanupVideoControls() {
    const oldVideo = document.getElementById('ks-bulk-controls');
    if (oldVideo) oldVideo.remove();
    document.querySelectorAll('.ks-bulk-checkbox-wrapper').forEach(el => el.remove());
  }

  function cleanupCollectionControls() {
    const oldCollection = document.getElementById('ks-bulk-controls-collection');
    if (oldCollection) oldCollection.remove();
    document.querySelectorAll('.ks-bulk-checkbox-wrapper-collection').forEach(el => el.remove());
  }

  // ========== 统一初始化 ==========
  let lastPageType = null;

  function runInit() {
    const url = location.href;
    let currentPageType = null;

    if (url.includes('/article/manage/video')) {
      currentPageType = 'video';
    } else if (url.includes('/article/publish/collection')) {
      currentPageType = 'collection';
    }

    // 页面类型切换时才清理旧控件
    if (lastPageType !== currentPageType) {
      if (lastPageType === 'video') {
        cleanupVideoControls();
      } else if (lastPageType === 'collection') {
        cleanupCollectionControls();
      }
      lastPageType = currentPageType;
    }

    if (currentPageType === 'video') {
      runInitVideo();
    } else if (currentPageType === 'collection') {
      runInitCollection();
    }
  }

  // ========== 持续检测目标节点并插入 ==========
  let lastUrl = location.href;
  let checkInterval = null;

  function startCheckLoop() {
    // 每500ms检测一次，持续检测
    if (checkInterval) clearInterval(checkInterval);
    let tryCount = 0;
    checkInterval = setInterval(() => {
      runInit();
      tryCount++;
      // 检测20次（约10秒）后停止高频检测，改为低频（每5秒）
      if (tryCount > 20) {
        clearInterval(checkInterval);
        checkInterval = setInterval(runInit, 5000);
      }
    }, 500);
  }

  function observeUrlChange() {
    // URL 变化监听（轮询法）
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        startCheckLoop();
      }
    }, 300);

    // history API 事件监听
    window.addEventListener('popstate', () => {
      startCheckLoop();
    });

    // 拦截 pushState
    const _pushState = history.pushState;
    history.pushState = function() {
      _pushState.apply(this, arguments);
      setTimeout(startCheckLoop, 100);
    };

    // 拦截 replaceState
    const _replaceState = history.replaceState;
    history.replaceState = function() {
      _replaceState.apply(this, arguments);
      setTimeout(startCheckLoop, 100);
    };

    // hashchange 监听
    window.addEventListener('hashchange', () => {
      startCheckLoop();
    });
  }

  function init() {
    startCheckLoop();
    observeUrlChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
