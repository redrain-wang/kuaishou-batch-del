(() => {
  function addControls() {
    // Avoid duplicates
    if (document.getElementById('ks-bulk-controls')) return;

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

    // 优先插入到 main-container-infinite-list 区域
    let inserted = false;
    // 0. 插入到 main-container-infinite-list div 下方
    const mainList = document.querySelector('.main-container-infinite-list');
    if (mainList && mainList.parentNode) {
      mainList.parentNode.insertBefore(container, mainList.nextSibling);
      inserted = true;
    }
    // 1. 插入到 works-manage div 下方
    if (!inserted) {
      const worksManage = document.querySelector('.works-manage');
      if (worksManage && worksManage.parentNode) {
        worksManage.parentNode.insertBefore(container, worksManage.nextSibling);
        inserted = true;
      }
    }
    // 1. 插入到 el-tabs__header（全部作品标签栏）下方
    if (!inserted) {
      const tabsHeader = document.querySelector('.el-tabs__header');
      if (tabsHeader && tabsHeader.parentNode) {
        tabsHeader.parentNode.insertBefore(container, tabsHeader.nextSibling);
        inserted = true;
      }
    }
    // 2. 插入到 el-tabs 或 el-tabs__nav 下方
    if (!inserted) {
      const tabsNav = document.querySelector('.el-tabs, .el-tabs__nav');
      if (tabsNav && tabsNav.parentNode) {
        tabsNav.parentNode.insertBefore(container, tabsNav.nextSibling);
        inserted = true;
      }
    }
    // 3. 插入到第一个 el-card 下方
    if (!inserted) {
      const elCard = document.querySelector('.el-card');
      if (elCard && elCard.parentNode) {
        elCard.parentNode.insertBefore(container, elCard.nextSibling);
        inserted = true;
      }
    }
    // 4. 插入到 body 顶部
    if (!inserted) {
      document.body.prepend(container);
    }
  }

  function getItems() {
    // 选中所有视频条目
    const rows = document.querySelectorAll('.video-item');
    const items = [];
    rows.forEach((el) => {
      // 从图片 src 的 clientCacheKey 提取 ID
      const img = el.querySelector('img[src*="clientCacheKey="]');
      let pid = null;
      if (img) {
        const m = img.src.match(/clientCacheKey=([a-zA-Z0-9_-]{10,32})\.jpg/);
        if (m) pid = m[1];
      }
      if (pid) items.push({ el, pid });
    });
    return items;
  }

  function selectAll() {
    const items = getItems();
    items.forEach(({ el }) => {
      el.style.outline = '2px solid #f33';
      el.setAttribute('data-selected', 'true');
    });
    alert(`Selected ${items.length} items`);
  }

  async function bulkDelete() {
    const items = getItems().filter(({ el }) => el.getAttribute('data-selected') === 'true');
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
    addControls();
    // Re-add on navigation changes (SPA)
    const ro = new MutationObserver(() => addControls());
    ro.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
