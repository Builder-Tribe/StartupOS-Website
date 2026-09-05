/**
 * DupeScout Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const btnOpenSidepanel = document.getElementById('btn-open-sidepanel');
  const btnViewSidepanelLink = document.getElementById('btn-view-sidepanel-link');
  const btnActiveTabScan = document.getElementById('btn-active-tab-scan');
  const imageFileInput = document.getElementById('image-file-input');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const loadingState = document.getElementById('loading-state');
  const resultsState = document.getElementById('results-state');
  const historyState = document.getElementById('history-state');
  const dupesList = document.getElementById('dupes-list');
  const historyList = document.getElementById('history-list');
  const resultsCount = document.getElementById('results-count');

  // Load initial search state & history
  await refreshUI();

  // Event Listeners
  btnOpenSidepanel?.addEventListener('click', openSidePanel);
  btnViewSidepanelLink?.addEventListener('click', openSidePanel);

  btnSearch?.addEventListener('click', () => {
    const val = searchInput.value.trim();
    if (val) triggerSearch({ queryText: val });
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) triggerSearch({ queryText: val });
    }
  });

  btnActiveTabScan?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        triggerSearch({ pageUrl: tab.url, sourceTitle: tab.title });
      }
    } catch (err) {
      console.error('[DupeScout] Active tab scan error:', err);
    }
  });

  imageFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        triggerSearch({ imageBase64: base64, sourceTitle: file.name });
      };
      reader.readAsDataURL(file);
    }
  });

  btnClearHistory?.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
    await refreshUI();
  });

  // Listen for search complete events from service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'DUPESCOUT_SEARCH_COMPLETE') {
      displayResults(message.data);
    }
  });

  async function openSidePanel() {
    try {
      const window = await chrome.windows.getCurrent();
      if (chrome.sidePanel?.open && window?.id) {
        await chrome.sidePanel.open({ windowId: window.id });
      }
    } catch (err) {
      console.log('[DupeScout] Could not open side panel:', err);
    }
  }

  async function triggerSearch(payload) {
    showState('loading');
    await chrome.runtime.sendMessage({
      type: 'TRIGGER_VISUAL_SEARCH',
      payload
    });
  }

  async function refreshUI() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_SEARCH' });
      if (!response) return;

      const { currentSearchState, recentSearches = [] } = response;

      if (currentSearchState?.status === 'loading') {
        showState('loading');
      } else if (currentSearchState?.status === 'complete' && currentSearchState.data) {
        displayResults(currentSearchState.data);
      } else {
        showState('history');
      }

      renderHistory(recentSearches);
    } catch (err) {
      console.error('[DupeScout] Refresh UI error:', err);
    }
  }

  function showState(state) {
    loadingState.classList.add('hidden');
    resultsState.classList.add('hidden');
    historyState.classList.add('hidden');

    if (state === 'loading') loadingState.classList.remove('hidden');
    else if (state === 'results') resultsState.classList.remove('hidden');
    else if (state === 'history') historyState.classList.remove('hidden');
  }

  function displayResults(data) {
    showState('results');
    dupesList.innerHTML = '';

    const allDupes = [
      ...(data.results?.smart_value || []),
      ...(data.results?.similar || [])
    ];

    resultsCount.textContent = `${allDupes.length} Dupes Found`;

    if (allDupes.length === 0) {
      dupesList.innerHTML = `<div class="sub-text" style="text-align:center; padding: 20px;">No dupes found for this item yet.</div>`;
      return;
    }

    allDupes.forEach((dupe) => {
      const card = document.createElement('div');
      card.className = 'dupe-card';
      const savingsText = dupe.savings_percent ? `-${dupe.savings_percent}%` : '';

      card.innerHTML = `
        <img src="${dupe.image_url}" alt="${dupe.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80'" />
        <div class="card-info">
          <div class="card-title">${dupe.name}</div>
          <div class="card-meta">
            <span class="price">₹${dupe.price.toLocaleString('en-IN')}</span>
            ${dupe.original_price ? `<span class="orig-price">₹${dupe.original_price.toLocaleString('en-IN')}</span>` : ''}
            ${savingsText ? `<span class="savings">${savingsText}</span>` : ''}
          </div>
          <div class="card-similarity">
            <span>${dupe.similarity_score}% Match</span>
            <div class="score-bar-bg">
              <div class="score-bar-fill" style="width: ${dupe.similarity_score}%"></div>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openSidePanel();
      });

      dupesList.appendChild(card);
    });
  }

  function renderHistory(searches) {
    historyList.innerHTML = '';
    if (!searches || searches.length === 0) {
      historyList.innerHTML = `<div class="sub-text" style="text-align:center; padding:10px;">No recent searches</div>`;
      return;
    }

    searches.slice(0, 5).forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      const title = item.query?.sourceTitle || item.query?.queryText || item.identified_product?.title || 'Visual Search';
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      el.innerHTML = `
        <span class="history-text">${title}</span>
        <span class="history-time">${timeStr}</span>
      `;

      el.addEventListener('click', () => {
        displayResults(item);
      });

      historyList.appendChild(el);
    });
  }
});
