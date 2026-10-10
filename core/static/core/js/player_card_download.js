(() => {
  const node = document.getElementById('player-card-data');
  const openButton = document.getElementById('download-card');
  const picker = document.getElementById('card-template-picker');
  if (!node || !openButton || !picker) return;

  const data = JSON.parse(node.textContent);
  const imageCache = new Map();
  const image = src => {
    if (!src) return Promise.resolve(null);
    if (imageCache.has(src)) return imageCache.get(src);
    const pending = new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    imageCache.set(src, pending);
    return pending;
  };
  const fit = (ctx, value, max, size, weight = 800) => {
    let text = String(value ?? '');
    ctx.font = `${weight} ${size}px Arial`;
    while (ctx.measureText(text).width > max && size > 14) {
      size -= 1; ctx.font = `${weight} ${size}px Arial`;
    }
    return {text, size};
  };
  const rounded = (ctx, x, y, w, h, r, fill, stroke) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  };

  // The original card design remains available as the Classic option.
  async function renderClassic(canvas, title) {
    const W = 940, H = 1670, scale = canvas.width / W;
    canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const [background, logo] = await Promise.all([image(data.background), image(data.logo)]);
    const portrait = await image(data.photo) || await image(data.original_photo);
    if (background) {
      const factor = Math.max(W / background.naturalWidth, H / background.naturalHeight);
      const iw = background.naturalWidth * factor, ih = background.naturalHeight * factor;
      ctx.drawImage(background, (W - iw) / 2, (H - ih) / 2, iw, ih);
    } else { ctx.fillStyle = '#090507'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = '#05030655'; ctx.fillRect(0, 0, W, H);
    if (logo) ctx.drawImage(logo, (W - 280) / 2, 35, 280, 120);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 13px Arial'; ctx.letterSpacing = '3px';
    ctx.fillText('YOUR CRICKET PERFORMANCE. YOUR IQ.', W / 2, 169); ctx.letterSpacing = '0px';
    rounded(ctx, 750, 50, 150, 72, 12, '#080607c9', '#ed233f');
    ctx.fillStyle = '#ff2746'; ctx.font = '900 18px Arial';
    ctx.fillText('PLAYER', 825, 80); ctx.fillText('CARD', 825, 104);
    if (portrait) {
      const area = {x: 0, y: 190, w: W, h: 720};
      const f = Math.max(area.w / portrait.naturalWidth, area.h / portrait.naturalHeight);
      const pw = portrait.naturalWidth * f, ph = portrait.naturalHeight * f;
      ctx.save();
      ctx.beginPath(); ctx.rect(area.x, area.y, area.w, area.h); ctx.clip();
      ctx.shadowColor = '#ff203e99'; ctx.shadowBlur = 30;
      ctx.drawImage(portrait, area.x + (area.w - pw) / 2, area.y, pw, ph);
      ctx.restore();
    } else {
      const glow = ctx.createRadialGradient(W / 2, 590, 20, W / 2, 590, 360);
      glow.addColorStop(0, '#8d1326'); glow.addColorStop(1, '#08050700');
      ctx.fillStyle = glow; ctx.fillRect(70, 220, 800, 640);
    }
    rounded(ctx, 34, 775, W - 68, 850, 25, '#080607e8', '#ed233f');
    ctx.textAlign = 'left';
    const name = (data.name || 'Player').trim().split(/\s+/), surname = name.length > 1 ? name.pop() : '';
    ctx.fillStyle = '#fff'; ctx.font = '800 40px Arial'; ctx.fillText(name.join(' ').toUpperCase(), 80, 841, 530);
    const last = fit(ctx, surname.toUpperCase(), 530, 58, 900);
    ctx.fillStyle = '#f52240'; ctx.font = `900 ${last.size}px Arial`; ctx.fillText(last.text, 80, 899, 530);
    ctx.fillStyle = '#f2e8e9'; ctx.font = '500 21px Arial';
    ctx.fillText([data.role, data.country].filter(Boolean).join('  •  '), 82, 934, 530);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 58px Arial';
    ctx.fillText(data.matches || '0', 735, 866);
    ctx.fillStyle = '#f4e9ea'; ctx.font = '700 14px Arial';
    ctx.fillText('CAREER', 735, 893); ctx.fillText('MATCHES', 735, 912);
    rounded(ctx, 35, 954, W - 70, 54, 12, '#f01635');
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '900 20px Arial'; ctx.letterSpacing = '3px';
    ctx.fillText(title === 'Matches' ? 'MATCHES BY OPPONENT' : `${title.toUpperCase()} CAREER STATS`, 79, 989); ctx.letterSpacing = '0px';
    const cards = data.cards[title] || [], cols = 3, gap = 12, left = 50, top = 1020;
    const cellW = (W - 100 - gap * 2) / cols, cellH = 124;
    cards.slice(0, 10).forEach(([label, value], i) => {
      const col = i % cols, row = Math.floor(i / cols), x = left + col * (cellW + gap), y = top + row * (cellH + 12);
      rounded(ctx, x, y, cellW, cellH, 15, '#110d0eea', i < 2 ? '#fa263f' : '#493236');
      ctx.textAlign = 'left'; ctx.fillStyle = '#f32643'; ctx.font = '900 28px Arial';
      ctx.fillText(['●', '◆', '▮', '◉', 'ϟ', '◉', '★', '④', '⑤', '●'][i] || '●', x + 17, y + 37);
      const lbl = fit(ctx, String(label).toUpperCase(), cellW - 62, 13, 700);
      ctx.fillStyle = '#f4ebec'; ctx.font = `700 ${lbl.size}px Arial`; ctx.fillText(lbl.text, x + 55, y + 38, cellW - 65);
      const val = fit(ctx, value, cellW - 30, 32, 900);
      ctx.fillStyle = '#fff'; ctx.font = `900 ${val.size}px Arial`; ctx.fillText(val.text, x + 18, y + 91, cellW - 32);
    });
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff9'; ctx.font = '600 12px Arial'; ctx.letterSpacing = '2px';
    ctx.fillText('SPORTIQ  •  YOUR CRICKET PERFORMANCE. YOUR IQ.', W / 2, 1600); ctx.letterSpacing = '0px';
  }

  // Red player poster inspired by the supplied cricket reference.
  async function renderPoster(canvas, title) {
    const W = 1024, H = 1536, scale = canvas.width / W;
    canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const [logo, portrait] = await Promise.all([
      image(data.logo), image(data.photo).then(cutout => cutout || image(data.original_photo)),
    ]);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#150509'); bg.addColorStop(.45, '#780813'); bg.addColorStop(1, '#160508');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(780, 520, 30, 780, 520, 760);
    glow.addColorStop(0, '#ff162b99'); glow.addColorStop(1, '#18050900');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = .12; ctx.strokeStyle = '#ff5360'; ctx.lineWidth = 20;
    for (let i = -H; i < W + H; i += 115) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - H * .55, H); ctx.stroke();
    }
    ctx.restore();

    // Use SportIQ's own logo as the soft background watermark.
    if (logo) {
      ctx.save(); ctx.globalAlpha = .16; ctx.filter = 'blur(13px)';
      ctx.drawImage(logo, 300, 390, 690, 300); ctx.restore();
    }
    if (portrait) {
      const area = {x: 480, y: 0, w: W - 480, h: H};
      const ratio = Math.max(area.w / portrait.naturalWidth, area.h / portrait.naturalHeight);
      const w = portrait.naturalWidth * ratio, h = portrait.naturalHeight * ratio;
      ctx.save();
      ctx.beginPath(); ctx.rect(area.x, area.y, area.w, area.h); ctx.clip();
      ctx.shadowColor = '#ff172c99'; ctx.shadowBlur = 34;
      ctx.drawImage(portrait, area.x + (area.w - w) / 2, area.y + (area.h - h) / 2, w, h);
      ctx.restore();
    }

    if (logo) ctx.drawImage(logo, 48, 45, 275, 116);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5c64d'; ctx.font = '700 16px Arial'; ctx.letterSpacing = '3px';
    ctx.fillText('SPORTIQ  ·  PLAYER CARD', 58, 195); ctx.letterSpacing = '0px';
    const nameParts = (data.name || 'PLAYER').trim().toUpperCase().split(/\s+/);
    const surname = nameParts.length > 1 ? nameParts.pop() : '';
    const first = nameParts.join(' ');
    ctx.fillStyle = '#fff';
    const firstSize = fit(ctx, first, 490, 58, 900).size;
    ctx.font = `900 ${firstSize}px Arial`; ctx.fillText(first, 56, 272, 490);
    ctx.fillStyle = '#f0182e';
    const surnameSize = fit(ctx, surname, 490, 76, 900).size;
    ctx.font = `900 ${surnameSize}px Arial`; ctx.fillText(surname, 56, 350, 490);
    ctx.fillStyle = '#f4d7d8'; ctx.font = '600 17px Arial'; ctx.letterSpacing = '1px';
    ctx.fillText(`${(data.role || 'PLAYER').toUpperCase()}${data.country ? `  ·  ${data.country.toUpperCase()}` : ''}`, 60, 385, 470);
    ctx.letterSpacing = '0px';

    let metrics;
    const cardStats = data.cards[title] || [];
    const statMap = Object.fromEntries(cardStats.map(([label, value]) => [String(label).toLowerCase(), value]));
    if (title === 'Batting') {
      metrics = [
        ['MATCHES', data.matches], ['RUNS', statMap.runs], ['HIGH SCORE', statMap['highest score']],
        ['AVERAGE', statMap.average], ['STRIKE RATE', statMap['strike rate']],
        ['50s / 100s', `${statMap['50s'] || 0} / ${statMap['100s'] || 0}`],
      ];
    } else if (title === 'Bowling') {
      metrics = [
        ['MATCHES', data.matches], ['WICKETS', statMap.wickets], ['BEST FIGURES', statMap['best figures']],
        ['ECONOMY', statMap.economy], ['AVERAGE', statMap.average], ['OVERS', statMap.overs],
      ];
    } else {
      metrics = [['CAREER MATCHES', data.matches], ['OPPONENTS', cardStats.length]];
      cardStats.slice(0, 4).forEach(([opponent, summary]) => metrics.push([opponent, summary]));
    }

    rounded(ctx, 34, 425, 448, 910, 20, '#090609e8', '#ed233f');
    ctx.fillStyle = '#ed233f'; ctx.fillRect(34, 425, 8, 910);
    const rowH = 143;
    metrics.slice(0, 6).forEach(([label, value], index) => {
      const y = 465 + index * rowH;
      ctx.textAlign = 'left'; ctx.fillStyle = '#f5c64d'; ctx.font = '700 16px Arial'; ctx.letterSpacing = '1px';
      ctx.fillText(String(label).toUpperCase(), 62, y); ctx.letterSpacing = '0px';
      ctx.fillStyle = '#fff';
      const metricValue = fit(ctx, String(value ?? '—').toUpperCase(), 380, 47, 900);
      ctx.font = `900 ${metricValue.size}px Arial`; ctx.fillText(metricValue.text, 62, y + 56, 380);
      if (index < metrics.length - 1) {
        ctx.beginPath(); ctx.moveTo(62, y + 83); ctx.lineTo(445, y + 83);
        ctx.strokeStyle = '#ffffff24'; ctx.lineWidth = 1; ctx.stroke();
      }
    });

    rounded(ctx, 34, 1394, 956, 92, 16, '#080608df', '#8d1726');
    ctx.textAlign = 'center'; ctx.fillStyle = '#f0e9ea'; ctx.font = '700 17px Arial'; ctx.letterSpacing = '4px';
    ctx.fillText('YOUR CRICKET PERFORMANCE. YOUR IQ.', W / 2, 1448); ctx.letterSpacing = '0px';
  }

  const closeButton = document.getElementById('card-template-close');
  const subtitle = document.getElementById('card-template-subtitle');
  let selectedTitle = 'Batting';
  const closePicker = () => { picker.hidden = true; openButton.focus(); };
  openButton.addEventListener('click', async () => {
    selectedTitle = document.querySelector('.player-card-slide.is-active')?.dataset.title || 'Batting';
    subtitle.textContent = `Choose a ${selectedTitle} design to download.`;
    picker.hidden = false;
    picker.querySelector('.card-template-option')?.focus();
    await Promise.all([
      renderClassic(picker.querySelector('[data-preview="classic"]'), selectedTitle),
      renderPoster(picker.querySelector('[data-preview="poster"]'), selectedTitle),
    ]);
  });
  closeButton.addEventListener('click', closePicker);
  picker.addEventListener('click', event => { if (event.target === picker) closePicker(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !picker.hidden) closePicker();
  });

  picker.querySelectorAll('[data-template-choice]').forEach(option => option.addEventListener('click', async () => {
    const choice = option.dataset.templateChoice;
    option.disabled = true;
    const label = option.querySelector('strong'), original = label.textContent;
    label.textContent = 'Preparing…';
    try {
      const canvas = document.createElement('canvas'); canvas.width = choice === 'classic' ? 1880 : 2048;
      if (choice === 'classic') await renderClassic(canvas, selectedTitle);
      else await renderPoster(canvas, selectedTitle);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Card image could not be created.');
      const link = document.createElement('a');
      link.download = `sportiq-${data.username}-${selectedTitle.toLowerCase()}-${choice}-card.png`;
      link.href = URL.createObjectURL(blob); link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      closePicker();
    } catch (error) {
      console.error('Player card download failed:', error);
      label.textContent = 'Try again';
    } finally {
      option.disabled = false;
      if (label.textContent === 'Preparing…') label.textContent = original;
    }
  }));
})();
