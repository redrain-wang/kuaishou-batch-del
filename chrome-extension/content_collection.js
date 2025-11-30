(() => {
  // 插入控制按钮
  function insertControlsToCollectionTop() {
    // 控制按钮只插入一次
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

    // 插入到合集页面合适位置（如列表顶部）
    const topNode = document.querySelector('.selected-list-item');
    if (topNode && topNode.parentNode) {
      topNode.parentNode.insertBefore(container, topNode);
    }
  }

  // 插入复选框
  function insertCheckboxes() {
    const rows = document.querySelectorAll('.selected-list-item');
    rows.forEach((el) => {
      const cover = el.querySelector('.selected-list-item__cover');
      if (cover && cover.parentNode) {
        if (cover.parentNode.querySelector('.ks-bulk-checkbox-wrapper')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'ks-bulk-checkbox-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.marginRight = '10px';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ks-bulk-checkbox';
        // checkbox.style.position = 'absolute';
        // checkbox.style.left = '0px';
        // checkbox.style.top = '0px';
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

  // 获取所有视频项
  function getItems() {
    const items = [];
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      let el = wrapper;
      while (el && !el.classList.contains('selected-list-item')) {
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
      // 去除下划线后缀
      if (pid) {
        pid = pid.replace(/_[^_]+$/, '');
      }
      if (el && pid && checkbox) {
        items.push({ el, pid, checkbox });
      }
    });
    return items;
  }

  // 全选
  function selectAll() {
    const wrappers = document.querySelectorAll('.ks-bulk-checkbox-wrapper');
    let count = 0;
    wrappers.forEach(wrapper => {
      const checkbox = wrapper.querySelector('input.ks-bulk-checkbox');
      if (checkbox) {
        checkbox.checked = true;
        count++;
      }
    });
    const items = getItems();
    items.forEach(({ el }) => {
      el.style.outline = '2px solid #f33';
      el.setAttribute('data-selected', 'true');
    });
    alert(`Selected ${count} items`);
  }

  // 批量删除
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

  // 初始化
  function init() {
    setTimeout(() => {
      insertControlsToCollectionTop();
      insertCheckboxes();
      // 只在有新.selected-list-item出现时插入控件
      let lastCount = document.querySelectorAll('.selected-list-item').length;
      const ro = new MutationObserver(() => {
        const nowCount = document.querySelectorAll('.selected-list-item').length;
        if (nowCount !== lastCount) {
          insertControlsToCollectionTop();
          insertCheckboxes();
          lastCount = nowCount;
        }
      });
      ro.observe(document.querySelector('body'), { childList: true, subtree: true });
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();