(() => {
  const node = document.getElementById('player-card-data');
  const button = document.getElementById('download-card');
  if (!node || !button) return;
  const data = JSON.parse(node.textContent);
  const W = 940, H = 1670, scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext('2d'); ctx.scale(scale, scale);
  const image = src => new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src;
  });
  const round = (x,y,w,h,r,fill,stroke) => {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fillStyle=fill; ctx.fill();
    if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=1.5; ctx.stroke(); }
  };
  const fit = (value, max, size, weight=800) => {
    let text = String(value || ''); ctx.font = `${weight} ${size}px Arial`;
    while (ctx.measureText(text).width > max && size > 14) { size -= 1; ctx.font = `${weight} ${size}px Arial`; }
    return {text,size};
  };
  async function drawCard(title, stats) {
    const [background, logo, portrait] = await Promise.all([
      image(data.background), image(data.logo), image(data.photo || data.original_photo)
    ]);
    if (background) {
      const factor = Math.max(W/background.naturalWidth, H/background.naturalHeight);
      const iw=background.naturalWidth*factor, ih=background.naturalHeight*factor;
      ctx.drawImage(background,(W-iw)/2,(H-ih)/2,iw,ih);
    } else { ctx.fillStyle='#090507'; ctx.fillRect(0,0,W,H); }
    ctx.fillStyle='#05030655'; ctx.fillRect(0,0,W,H);
    if (logo) ctx.drawImage(logo,(W-280)/2,35,280,120);
    ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.font='700 13px Arial'; ctx.letterSpacing='3px';
    ctx.fillText('YOUR CRICKET PERFORMANCE. YOUR IQ.',W/2,169); ctx.letterSpacing='0px';
    round(750,50,150,72,12,'#080607c9','#ed233f');
    ctx.fillStyle='#ff2746'; ctx.font='900 18px Arial'; ctx.textAlign='center';
    ctx.fillText('PLAYER',825,80); ctx.fillText('CARD',825,104);
    if (portrait) {
      const area={x:105,y:210,w:730,h:680};
      const f=Math.min(area.w/portrait.naturalWidth,area.h/portrait.naturalHeight);
      const pw=portrait.naturalWidth*f, ph=portrait.naturalHeight*f;
      ctx.save(); ctx.shadowColor='#ff203e99'; ctx.shadowBlur=30;
      ctx.drawImage(portrait,area.x+(area.w-pw)/2,area.y+area.h-ph,pw,ph); ctx.restore();
    } else {
      const glow=ctx.createRadialGradient(W/2,590,20,W/2,590,360);
      glow.addColorStop(0,'#8d1326'); glow.addColorStop(1,'#08050700');
      ctx.fillStyle=glow; ctx.fillRect(70,220,800,640);
    }
    const panelY=775;
    round(34,panelY,W-68,850,25,'#080607e8','#ed233f');
    ctx.textAlign='left';
    const name=(data.name || 'Player').trim().split(/\s+/);
    const surname=name.length>1?name.pop():'';
    ctx.fillStyle='#fff'; ctx.font='800 40px Arial'; ctx.fillText(name.join(' ').toUpperCase(),80,841,530);
    ctx.fillStyle='#f52240'; const last=fit(surname.toUpperCase(),530,58,900);
    ctx.font=`900 ${last.size}px Arial`; ctx.fillText(last.text,80,899,530);
    ctx.fillStyle='#f2e8e9'; ctx.font='500 21px Arial';
    ctx.fillText([data.role,data.country].filter(Boolean).join('  •  '),82,934,530);
    ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.font='900 58px Arial';
    ctx.fillText(data.matches || '0',735,866);
    ctx.fillStyle='#f4e9ea'; ctx.font='700 14px Arial';
    ctx.fillText('CAREER',735,893); ctx.fillText('MATCHES',735,912);
    round(35,954,W-70,54,12,'#f01635');
    ctx.textAlign='left'; ctx.fillStyle='#fff'; ctx.font='900 20px Arial'; ctx.letterSpacing='3px';
    ctx.fillText(title === 'Matches' ? 'MATCHES BY OPPONENT' : `${title.toUpperCase()} CAREER STATS`,79,989); ctx.letterSpacing='0px';
    const cards=stats || [], cols=3, gap=12, left=50, top=1020, cellW=(W-100-gap*2)/cols, cellH=124;
    cards.slice(0,10).forEach(([label,value],i)=>{
      const col=i%cols, row=Math.floor(i/cols), x=left+col*(cellW+gap), y=top+row*(cellH+12);
      round(x,y,cellW,cellH,15,'#110d0eea',i<2?'#fa263f':'#493236');
      ctx.textAlign='left'; ctx.fillStyle='#f32643'; ctx.font='900 28px Arial';
      ctx.fillText(['●','◆','▮','◉','ϟ','◉','★','④','⑤','●'][i] || '●',x+17,y+37);
      const lbl=fit(String(label).toUpperCase(),cellW-62,13,700);
      ctx.fillStyle='#f4ebec'; ctx.font=`700 ${lbl.size}px Arial`; ctx.fillText(lbl.text,x+55,y+38,cellW-65);
      const val=fit(value,cellW-30,32,900); ctx.fillStyle='#fff'; ctx.font=`900 ${val.size}px Arial`;
      ctx.fillText(val.text,x+18,y+91,cellW-32);
    });
    ctx.textAlign='center'; ctx.fillStyle='#fff9'; ctx.font='600 12px Arial'; ctx.letterSpacing='2px';
    ctx.fillText('SPORTIQ  •  YOUR CRICKET PERFORMANCE. YOUR IQ.',W/2,1600); ctx.letterSpacing='0px';
  }
  button.addEventListener('click',async()=>{
    button.disabled=true; const original=button.innerHTML; button.textContent='Preparing card…';
    try {
      const title=document.querySelector('.player-card-slide.is-active')?.dataset.title || 'Batting';
      const linkTitle=title.toLowerCase();
      await drawCard(title,data.cards[title] || []);
      const link=document.createElement('a'); link.download=`sportiq-${data.username}-${linkTitle}-card.png`;
      link.href=canvas.toDataURL('image/png'); link.click(); button.textContent='✓  Downloaded';
    } catch(error) { console.error('Player card download failed:',error); button.textContent='Could not create card'; }
    window.setTimeout(()=>{button.innerHTML=original;button.disabled=false;},1800);
  });
})();
