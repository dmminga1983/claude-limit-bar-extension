// Полоска лимита Claude. Работает только на claude.ai, данные никуда не отправляет:
// запрашивает только claude.ai от имени уже вошедшего пользователя.
(() => {
  const LABELS = {
    five_hour: ['5ч', '5 часов'],
    seven_day: ['нед', 'неделя'],
    seven_day_sonnet: ['нед S', 'неделя Sonnet'],
    seven_day_opus: ['нед O', 'неделя Opus']
  };
  const REFRESH_MS = 60 * 1000;
  let orgId = null;
  let lastData = null;

  // Значок встраивается в строку под полем ввода, между микрофоном и выбором модели.
  const badge = document.createElement('div');
  badge.id = 'claude-limit-badge';
  Object.assign(badge.style, {
    display: 'inline-flex', gap: '10px', alignItems: 'center', flexShrink: '0',
    marginLeft: '10px', marginRight: '6px', font: '12px/1 system-ui, sans-serif',
    position: 'relative', zIndex: '1', cursor: 'default', whiteSpace: 'nowrap'
  });

  // Подсказка при наведении: время до сброса.
  const tip = document.createElement('div');
  Object.assign(tip.style, {
    position: 'fixed', zIndex: '2147483647', display: 'none', pointerEvents: 'none',
    padding: '6px 9px', borderRadius: '8px', font: '12px/1.45 system-ui, sans-serif',
    background: 'rgba(25,25,25,0.96)', color: '#eee', whiteSpace: 'pre',
    boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
  });
  document.body.appendChild(tip);
  badge.addEventListener('mouseenter', () => {
    tip.textContent = tipText();
    tip.style.display = 'block';
    const r = badge.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, r.left) + 'px';
    tip.style.top = Math.max(8, r.top - tr.height - 8) + 'px';
  });
  badge.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

  function colorFor(used) {
    if (used >= 90) return '#ff5c5c';
    if (used >= 70) return '#f5c542';
    return '#4cd17a';
  }

  function untilReset(iso) {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - Date.now();
    if (!isFinite(ms) || ms <= 0) return '';
    const m = Math.round(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d > 0) return `сброс через ${d} д ${h} ч`;
    if (h > 0) return `сброс через ${h} ч ${mm} мин`;
    return `сброс через ${mm} мин`;
  }

  function windows() {
    const out = [];
    for (const key of Object.keys(LABELS)) {
      const w = lastData && lastData[key];
      if (!w || w.utilization == null) continue;
      const used = Math.max(0, Math.min(100, Number(w.utilization) || 0));
      out.push({ key, used, left: Math.round(100 - used), reset: untilReset(w.resets_at) });
    }
    return out;
  }

  function tipText() {
    const ws = windows();
    if (!ws.length) return 'Лимит Claude: нет данных';
    return ws.map(w => `${LABELS[w.key][1]}: осталось ${w.left}%${w.reset ? ' · ' + w.reset : ''}`).join('\n');
  }

  // Бейдж-шкала: сама полоска служит фоном, заливка = % использования,
  // цвет меняется зелёный → жёлтый → красный, текст лежит поверх и всегда читаем.
  function pill(key, w, narrow) {
    const wrap = document.createElement('span');
    wrap.className = 'clb-pill';
    Object.assign(wrap.style, {
      position: 'relative', display: 'inline-flex', alignItems: 'center',
      minWidth: narrow ? '48px' : '78px', height: '19px', borderRadius: '5px',
      overflow: 'hidden', background: 'rgba(128,128,128,0.28)',
      border: '1px solid rgba(255,255,255,0.1)'
    });
    const fill = document.createElement('span');
    Object.assign(fill.style, {
      position: 'absolute', left: '0', top: '0', bottom: '0',
      width: w.used + '%', background: colorFor(w.used),
      transition: 'width .3s ease, background .3s ease'
    });
    wrap.appendChild(fill);
    const txt = document.createElement('span');
    Object.assign(txt.style, {
      position: 'relative', zIndex: '1', width: '100%', textAlign: 'center',
      padding: '0 6px', fontWeight: '600', fontSize: '11px', color: '#fff',
      textShadow: '0 0 2px #000, 0 0 2px #000, 0 1px 1px #000', whiteSpace: 'nowrap'
    });
    // Показываем ИСПОЛЬЗОВАННЫЙ процент (w.used), а не оставшийся (w.left) —
    // иначе число не совпадает с заливкой: при 2% использования заливка
    // почти пустая, а подпись показывала бы "98%" (сколько осталось), что
    // выглядит как ошибка. w.left по-прежнему используется в tipText(), где
    // явно написано слово "осталось".
    txt.textContent = `${LABELS[key][0]} ${Math.round(w.used)}%`;
    wrap.appendChild(txt);
    return wrap;
  }

  let narrow = false;

  // Всегда показываем и 5-часовой, и недельный лимит — в узком окне
  // шкалы просто сжимаются, а не пропадают.
  function render() {
    const ws = windows().slice(0, 2);
    if (!ws.length) { badge.replaceChildren(); return; }
    badge.replaceChildren(...ws.map(w => pill(w.key, w, narrow)));
  }

  // Найти место: перед правой группой (выбор модели) в строке под полем ввода.
  function place() {
    const model = document.querySelector('button[aria-label^="Модель"], button[aria-label^="Model"]');
    if (!model) return;
    let right = model;
    while (right && !/\b(ms-auto|ml-auto)\b/.test(String(right.className))) right = right.parentElement;
    if (!right || !right.parentElement) return;
    if (!(badge.parentElement === right.parentElement && badge.nextElementSibling === right)) {
      right.parentElement.insertBefore(badge, right);
    }
    // В узком окне шкалы становятся компактнее, но не скрываются.
    const wasNarrow = narrow;
    narrow = right.parentElement.getBoundingClientRect().width < 520;
    if (narrow !== wasNarrow) render();
  }

  function cookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  async function getOrg() {
    if (orgId) return orgId;
    orgId = cookie('lastActiveOrg');
    if (orgId) return orgId;
    const r = await fetch('/api/organizations', { credentials: 'include' });
    if (!r.ok) throw new Error('organizations ' + r.status);
    const list = await r.json();
    orgId = Array.isArray(list) && list[0] && list[0].uuid;
    if (!orgId) throw new Error('нет организации');
    return orgId;
  }

  async function refresh() {
    try {
      const id = await getOrg();
      const r = await fetch(`/api/organizations/${id}/usage`, { credentials: 'include' });
      if (!r.ok) { orgId = null; throw new Error('usage ' + r.status); }
      lastData = await r.json();
      render();
    } catch (e) {
      lastData = null;
      badge.textContent = '';
    }
    place();
  }

  // Страница перерисовывается при переходах между чатами — возвращаем значок на место.
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; place(); });
  }).observe(document.body, { childList: true, subtree: true });

  refresh();
  setInterval(refresh, REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
