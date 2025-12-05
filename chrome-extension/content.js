  // 为每个 .video-item 插入复选框，只插入一次
  function insertCheckboxes() {
    const rows = document.querySelectorAll('.video-item');
    rows.forEach((el) => {
      const cover = el.querySelector('.video-item__cover');
      if (cover && cover.parentNode) {
        // 已有则跳过
        if (cover.parentNode.querySelector('.ks-bulk-checkbox-wrapper')) return;
        // 创建外层div
        const wrapper = document.createElement('div');
        wrapper.className = 'ks-bulk-checkbox-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.marginRight = '20px';
        // 创建复选框
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
        // 组装结构
        wrapper.appendChild(checkbox);
        // 插入到cover的上方
        cover.parentNode.insertBefore(wrapper, cover);
      }
    });
  }
(() => {
  function insertControlsToWorksManageTop() {
    // 移除已存在按钮
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
    selectAllBtn.onclick = selectAll;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '批量删除';
    deleteBtn.style.fontWeight = 'bold';
    deleteBtn.style.background = '#333';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '8px 16px';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.onclick = bulkDelete;

    container.appendChild(selectAllBtn);
    container.appendChild(deleteBtn);

    // 插入到 works-manage__status div 下方，紧挨着
    const statusDiv = document.querySelector('.works-manage__status');
    if (statusDiv && statusDiv.parentNode) {
      statusDiv.parentNode.insertBefore(container, statusDiv.nextSibling);
    }
  }

  function addControls() {
    insertControlsToWorksManageTop();
  }

  function getItems() {
    // 只收集页面上已存在的复选框，不再插入新节点
    const items = [];
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      // 找到最近的 .video-item
      let el = wrapper;
      while (el && !el.classList.contains('video-item')) {
        el = el.parentElement;
      }
      // 提取 pid
      let pid = null;
      if (el) {
        const img = el.querySelector('img[src*="clientCacheKey="]');
        if (img) {
          const m = img.src.match(/clientCacheKey=([a-zA-Z0-9_-]{10,32})\.jpg/);
          if (m) pid = m[1];
        }
      }
      // 如果pid有下划线后缀（如 _ccc、_eee、_123），则去除
      if (pid) {
        pid = pid.replace(/_[^_]+$/, '');
      }
      if (el && pid && checkbox) {
        items.push({ el, pid, checkbox });
      }
    });
    return items;
  }

  function selectAll() {
    // 只设置页面上已存在的复选框 checked 状态
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    let count = 0;
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      if (checkbox) {
        checkbox.checked = true;
        count++;
      }
    });
    // 同时给 video-item 加选中样式
    const items = getItems();
    items.forEach(({ el }) => {
      el.style.outline = '2px solid #f33';
      el.setAttribute('data-selected', 'true');
    });
    alert(`Selected ${count} items`);
  }

  async function bulkDelete() {
    const items = getItems().filter(({ checkbox }) => checkbox && checkbox.checked);
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
        // If the site requires __NS_sig3, it's typically computed server-side and may be present; omit here.
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

  function init() {
    setTimeout(() => {
      addControls();
      insertCheckboxes();
      // Re-add on navigation changes (SPA)
      const ro = new MutationObserver((mutations) => {
        // 如果变动节点包含 ks-bulk-controls，则跳过本次插入，避免死循环
        for (const m of mutations) {
          if (m.addedNodes) {
            for (const node of m.addedNodes) {
              if (node.id === 'ks-bulk-controls') return;
            }
          }
        }
        insertControlsToWorksManageTop();
        insertCheckboxes();
      });
      ro.observe(document.documentElement, { childList: true, subtree: true });
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
