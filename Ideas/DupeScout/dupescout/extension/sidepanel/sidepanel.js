/**
 * DupeScout Side Panel Interactive Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // UI Elements
  const refImage = document.getElementById('ref-image');
  const refTitle = document.getElementById('ref-title');
  const refPrice = document.getElementById('ref-price');
  const refStore = document.getElementById('ref-store');

  const comparisonList = document.getElementById('comparison-list');
  const panelLoading = document.getElementById('panel-loading');
  const btnRefresh = document.getElementById('btn-refresh');
  const tabBtns = document.querySelectorAll('.tab-btn');

  let currentData = null;
  let activeTierFilter = 'all';

  // Load initial state
  await loadCurrentData();

  // Listeners
  btnRefresh?.addEventListener('click', loadCurrentData);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTierFilter = e.target.getAttribute('data-tier');
      if (currentData) renderDupesList(currentData);
    });
  });

  // Listen for background updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'DUPESCOUT_SEARCH_COMPLETE') {
      currentData = message.data;
      renderAll(currentData);
    }
  });

  async function loadCurrentData() {
    try {
      panelLoading.style.display = 'flex';
      const stored = await chrome.storage.local.get('currentSearchState');
      
      if (stored.currentSearchState?.status === 'complete' && stored.currentSearchState.data) {
        currentData = stored.currentSearchState.data;
        renderAll(currentData);
      } else if (stored.currentSearchState?.status === 'loading') {
        panelLoading.style.display = 'flex';
      } else {
        // Fallback default demonstration dataset
        currentData = {
          identified_product: {
            title: 'Designer Silk Blend Dress',
            category: 'Apparel',
            estimated_retail_price: 8999
          },
          query: {
            imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80'
          },
          results: {
            smart_value: [
              {
                id: 'prod_dupe_1',
                name: 'Urban Luxe Dupe',
                brand: 'Westside / Zudio Luxe',
                price: 2499,
                original_price: 3499,
                image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
                similarity_score: 92.5,
                similarity_tier: 'smart_value',
                savings_percent: 72,
                similarity_breakdown: { shape: 95, color: 92, material: 88, style: 95 },
                ai_explanation: 'Identical silhouette and color tone. Crafted with high-density cotton blend instead of pure silk, delivering 72% price savings.'
              },
              {
                id: 'prod_dupe_2',
                name: 'Minimalist Luxe Edition',
                brand: 'FabAlley',
                price: 1899,
                original_price: 2999,
                image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80',
                similarity_score: 87.0,
                similarity_tier: 'smart_value',
                savings_percent: 79,
                similarity_breakdown: { shape: 90, color: 85, material: 84, style: 89 },
                ai_explanation: 'Matches overall cut and aesthetic perfectly with slightly lighter weave structure.'
              }
            ],
            similar: [
              {
                id: 'prod_dupe_3',
                name: 'Streetwear Variant',
                brand: 'Souled Store',
                price: 1299,
                original_price: 1999,
                image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
                similarity_score: 78.4,
                similarity_tier: 'similar',
                savings_percent: 85,
                similarity_breakdown: { shape: 80, color: 78, material: 75, style: 80 },
                ai_explanation: 'Similar overall color palette and mood with a slightly more relaxed fit.'
              }
            ]
          }
        };
        renderAll(currentData);
      }
    } catch (err) {
      console.error('[DupeScout SidePanel] Error loading state:', err);
    } finally {
      panelLoading.style.display = 'none';
    }
  }

  function renderAll(data) {
    panelLoading.style.display = 'none';
    
    // Render Reference Item
    const query = data.query || {};
    const identified = data.identified_product || {};

    refImage.src = query.imageUrl || data.results?.original?.[0]?.image_url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80';
    refTitle.textContent = query.sourceTitle || query.queryText || identified.title || 'Selected Product';
    
    const refPriceVal = identified.estimated_retail_price || data.results?.original?.[0]?.price || 8999;
    refPrice.textContent = `₹${refPriceVal.toLocaleString('en-IN')}`;
    refStore.textContent = query.pageUrl ? new URL(query.pageUrl).hostname.replace('www.', '') : 'Original Product';

    // Render Dupes
    renderDupesList(data);
  }

  function renderDupesList(data) {
    comparisonList.innerHTML = '';

    const smartValue = data.results?.smart_value || [];
    const similar = data.results?.similar || [];

    let filtered = [];
    if (activeTierFilter === 'smart_value') filtered = smartValue;
    else if (activeTierFilter === 'similar') filtered = similar;
    else filtered = [...smartValue, ...similar];

    if (filtered.length === 0) {
      comparisonList.innerHTML = `<div style="text-align:center; color: var(--text-sub); padding: 30px;">No matching dupes found for this filter category.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'dupe-item-card';

      const bd = item.similarity_breakdown || { shape: 90, color: 90, material: 85, style: 90 };
      const savingsStr = item.savings_percent ? `Save ${item.savings_percent}%` : '';

      card.innerHTML = `
        <div class="item-top">
          <img src="${item.image_url}" alt="${item.name}" class="item-img" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80'" />
          <div class="item-main-info">
            <span class="brand-badge">${item.brand || 'DupeScout Seller'}</span>
            <h4 class="item-title">${item.name}</h4>
            <div class="price-row">
              <span class="dupe-price">₹${item.price.toLocaleString('en-IN')}</span>
              ${savingsStr ? `<span class="savings-pill">${savingsStr}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="match-header">
          <span>Visual Match Score:</span>
          <span class="score-num">${item.similarity_score}% Match</span>
        </div>

        <div class="breakdown-grid">
          <div class="metric-item">
            <div class="metric-label"><span>Shape / Cut</span><span>${bd.shape}%</span></div>
            <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${bd.shape}%"></div></div>
          </div>
          <div class="metric-item">
            <div class="metric-label"><span>Color / Pattern</span><span>${bd.color}%</span></div>
            <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${bd.color}%"></div></div>
          </div>
          <div class="metric-item">
            <div class="metric-label"><span>Material Feel</span><span>${bd.material}%</span></div>
            <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${bd.material}%"></div></div>
          </div>
          <div class="metric-item">
            <div class="metric-label"><span>Overall Style</span><span>${bd.style}%</span></div>
            <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${bd.style}%"></div></div>
          </div>
        </div>

        ${item.ai_explanation ? `
          <div class="ai-box">
            <strong>AI Comparison:</strong> ${item.ai_explanation}
          </div>
        ` : ''}

        <a href="http://localhost:3000/product/${item.id}" target="_blank" class="buy-btn">
          <span>View Dupe on DupeScout &rarr;</span>
        </a>
      `;

      comparisonList.appendChild(card);
    });
  }
});
