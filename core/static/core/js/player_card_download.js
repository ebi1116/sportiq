(() => {
  const dataNode = document.getElementById('player-card-data');
  const button = document.getElementById('download-card');
  if (!dataNode || !button) return;
  const data = JSON.parse(dataNode.textContent);
  const canvas = document.createElement('canvas');
  const outputScale = 2;
  canvas.width = canvas.height = 1080 * outputScale;
  const ctx = canvas.getContext('2d');
  ctx.scale(outputScale, outputScale);
  const round = (x, y, w, h, r, color) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = color; ctx.fill();
  };
  const cover = (img, x, y, w, h) => {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * scale, ih = img.naturalHeight * scale;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  };
  const image = src => new Promise(resolve => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src;
  });

  async function drawCard() {
    const W = 1080, H = 1080;
    const background = await image(data.background);
    if (background) cover(background, 0, 0, W, H);
    else { ctx.fillStyle = '#09090c'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = '#05050924'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = .12;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(690 + i * 55, 0); ctx.lineTo(720 + i * 55, 0);
      ctx.lineTo(960 + i * 25, 510); ctx.lineTo(850 + i * 25, 510); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#ff334f' : '#ffffff'; ctx.fill();
    }
    ctx.restore();

    ctx.save(); ctx.beginPath(); ctx.roundRect(44, 42, 992, 486, 30); ctx.clip();
    if (data.photo) {
      const portrait = await image(data.photo);
      if (portrait) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(610, 52, 426, 468, 26); ctx.clip();
        cover(portrait, 610, 52, 426, 468);
        const blend = ctx.createLinearGradient(570, 0, 840, 0);
        blend.addColorStop(0, '#10080d'); blend.addColorStop(.4, '#10080d33'); blend.addColorStop(1, '#10080d00');
        ctx.fillStyle = blend; ctx.fillRect(570, 52, 466, 468);
        const fade = ctx.createLinearGradient(610, 410, 610, 525);
        fade.addColorStop(0, '#12080c00'); fade.addColorStop(1, '#12080c');
        ctx.fillStyle = fade; ctx.fillRect(610, 410, 426, 115); ctx.restore();
      }
    }
    ctx.restore();
    round(44, 42, 992, 486, 30, '#ffffff08');
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff1a'; ctx.beginPath(); ctx.roundRect(44, 42, 992, 486, 30); ctx.stroke();

    const logo = await image(data.logo);
    // Use the wide wordmark crop, not the square app icon, to keep the brand readable.
    if (logo) ctx.drawImage(logo, 78, 54, 350, 150);
    ctx.fillStyle = '#e8a9b4'; ctx.font = '700 16px Arial'; ctx.letterSpacing = '2px';
    ctx.fillText('YOUR CRICKET PERFORMANCE. YOUR IQ.', 78, 221);
    round(78, 241, 5, 25, 3, '#ef2948');
    ctx.fillStyle = '#ff8293'; ctx.font = '800 16px Arial'; ctx.letterSpacing = '3px'; ctx.fillText('SPORTIQ  •  PLAYER CARD', 98, 260);
    ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff';
    ctx.font = '900 60px Arial'; ctx.letterSpacing = '-1px'; ctx.fillText(data.name.toUpperCase(), 78, 360, 510); ctx.restore();
    ctx.fillStyle = '#f4dfe3'; ctx.font = '700 23px Arial'; ctx.letterSpacing = '2px';
    ctx.fillText([data.role, data.country].filter(Boolean).join('  ·  ').toUpperCase(), 80, 401, 500);
    round(78, 426, 228, 48, 14, '#ffffff12');
    ctx.fillStyle = '#f4c9d0'; ctx.font = '700 15px Arial'; ctx.letterSpacing = '2px'; ctx.fillText('CAREER MATCHES', 96, 446);
    ctx.fillStyle = '#fff'; ctx.font = '900 23px Arial'; ctx.letterSpacing = '0'; ctx.fillText(data.matches, 96, 470);

    const statShade = ctx.createLinearGradient(0, 520, 0, 1080);
    statShade.addColorStop(0, '#09090dbb'); statShade.addColorStop(1, '#08080df0');
    ctx.fillStyle = statShade; ctx.fillRect(0, 520, W, 560);
    ctx.fillStyle = '#ff667d'; ctx.font = '900 15px Arial'; ctx.letterSpacing = '3px'; ctx.fillText('01', 54, 581);
    ctx.fillStyle = '#fff'; ctx.font = '900 32px Arial'; ctx.letterSpacing = '0'; ctx.fillText('Batting', 98, 582);
    ctx.fillStyle = '#aaa5aa'; ctx.font = '500 16px Arial'; ctx.fillText('Career batting record', 98, 610);
    const x0 = 54, gap = 18, cellW = 477, cellH = 74, top = 634, rowGap = 12;
    const glyphs = ['▥', '↯', '◆', 'Ø', '50', '100', '★', '4', '6'];
    data.stats.forEach(([label, value], i) => {
      const compact = i >= 6;
      const w = compact ? (972 - 28) / 3 : cellW;
      const col = compact ? i - 6 : i % 2;
      const row = compact ? 3 : Math.floor(i / 2);
      const x = compact ? x0 + col * (w + 14) : x0 + col * (cellW + gap);
      const y = top + row * (cellH + rowGap), primary = i < 2;
      round(x, y, w, cellH, 16, primary ? '#250b12' : '#151519');
      ctx.lineWidth = primary ? 2 : 1.5; ctx.strokeStyle = primary ? '#b51d38' : '#ffffff17';
      ctx.beginPath(); ctx.roundRect(x, y, w, cellH, 16); ctx.stroke();
      round(x + 14, y + 20, 34, 34, 10, primary ? '#e32645' : '#29292f');
      ctx.fillStyle = primary ? '#fff' : '#d5d2d5'; ctx.font = '800 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(glyphs[i] || '•', x + 31, y + 37); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#c4bec2'; ctx.font = `600 ${compact ? 14 : 17}px Arial`; ctx.letterSpacing = '.3px'; ctx.fillText(label, x + 58, y + 46);
      ctx.fillStyle = primary ? '#ff526c' : '#fff'; ctx.font = `900 ${compact ? 22 : 27}px Arial`; ctx.letterSpacing = '0'; ctx.textAlign = 'right';
      ctx.fillText(value, x + w - 14, y + 48); ctx.textAlign = 'left';
    });
    ctx.fillStyle = '#ffffff22'; ctx.fillRect(54, 1012, 972, 1);
    ctx.fillStyle = '#e4aeb7'; ctx.font = '700 13px Arial'; ctx.letterSpacing = '3px';
    ctx.fillText('YOUR CRICKET PERFORMANCE. YOUR IQ.', 54, 1038);
    ctx.fillStyle = '#7f7b80'; ctx.font = '600 13px Arial'; ctx.textAlign = 'right'; ctx.letterSpacing = '1px';
    ctx.fillText('SPORTIQ  ·  ' + data.username.toUpperCase(), 1026, 1038); ctx.textAlign = 'left';
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = 'Preparing card…';
    try {
      await drawCard();
      const link = document.createElement('a'); link.download = `sportiq-${data.username}-batting.png`;
      link.href = canvas.toDataURL('image/png'); link.click();
      button.textContent = '✓  Downloaded';
    } catch (_) { button.textContent = 'Could not create card'; }
    window.setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 1800);
  });
})();
