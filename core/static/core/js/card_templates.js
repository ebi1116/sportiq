(() => {
  const original = document.getElementById('download-card');
  if (!original || !window.playerCardExport) return;
  const trigger = original.cloneNode(true);
  original.replaceWith(trigger);

  const data = window.playerCardExport;
  const carousel = document.getElementById('player-card-carousel');
  const slides = [...carousel.querySelectorAll('.player-card-slide')];
  const themes = [
    {name:'Stadium Red', style:'red', colors:['#17070b','#690d20','#ff2948'], ink:'#fff'},
    {name:'Royal Blue', style:'blue', colors:['#06162f','#063d72','#40b8ff'], ink:'#fff'},
    {name:'Black & Gold', style:'gold', colors:['#090909','#211a08','#e6b83e'], ink:'#fff'},
    {name:'Sunset', style:'sunset', colors:['#081520','#6e351f','#ff9b50'], ink:'#fff'},
    {name:'Ice Blue', style:'ice', colors:['#07172a','#10365a','#66d4ff'], ink:'#fff'},
    {name:'Boundary Green', style:'green', colors:['#07170d','#16451e','#a5df53'], ink:'#fff'},
    {name:'Editorial', style:'editorial', colors:['#f3f0e9','#171717','#e33a36'], ink:'#151515'},
    {name:'Full Bleed', style:'fullbleed', colors:['#090b10','#171a22','#ff334f'], ink:'#fff'}
  ];
  let dialog, photoPromise;

  function loadPhoto() {
    if (!photoPromise) photoPromise = new Promise(resolve => {
      if (!data.photoUrl) return resolve(null);
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = data.photoUrl;
      if (image.decode) image.decode().then(() => resolve(image)).catch(() => {});
    });
    return photoPromise;
  }

  function drawCard(canvas, theme, slide, ratio, photo) {
    const W = 900, H = 1350, ctx = canvas.getContext('2d');
    canvas.width = W * ratio; canvas.height = H * ratio; ctx.setTransform(ratio,0,0,ratio,0,0);
    const [dark, mid, accent] = theme.colors, light = theme.ink !== '#151515';
    const nameColor = light ? '#fff' : '#111';
    const subColor = light ? '#f1dce0' : '#444';
    const sectionTitle = slide.dataset.title;
    const recordLabel = sectionTitle === 'Matches' ? 'OPPONENT RECORD' : `${sectionTitle.toUpperCase()} CAREER RECORD`;
    const opponentStats = [...slide.querySelectorAll('.opponent-row')].map(row => {
      const team = row.querySelector('.opponent-team strong').textContent.trim();
      const matches = row.querySelector('.opponent-team small').textContent.trim();
      const runs = row.querySelector('.opponent-runs').textContent.trim().replace(/\s+/g,' ');
      return [`${team} · ${matches}`, runs];
    });
    const items = sectionTitle === 'Batting' ? data.battingStats : sectionTitle === 'Bowling' ? data.bowlingStats : (opponentStats.length ? opponentStats.slice(0,9) : [['Matches', `${data.matches}`]]);
    const playerName = data.playerName.toUpperCase();
    const role = [data.role, data.city].filter(Boolean).join(' · ').toUpperCase();
    const gradient = ctx.createLinearGradient(0,0,W,H); gradient.addColorStop(0,dark); gradient.addColorStop(.55,mid); gradient.addColorStop(1,dark);
    ctx.fillStyle = gradient; ctx.fillRect(0,0,W,H);
    const cover = (x,y,w,h,alpha=1) => {
      if (!photo) { ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle=accent; ctx.beginPath(); ctx.arc(x+w*.68,y+h*.45,Math.min(w,h)*.42,0,Math.PI*2); ctx.fill(); ctx.restore(); return; }
      const s=Math.max(w/photo.naturalWidth,h/photo.naturalHeight), iw=photo.naturalWidth*s, ih=photo.naturalHeight*s;
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.globalAlpha=alpha; ctx.drawImage(photo,x+(w-iw)/2,y+(h-ih)/2,iw,ih); ctx.restore();
    };
    const text=(value,x,y,size,color=nameColor,weight=800,max=W-120)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial`;ctx.letterSpacing='0px';ctx.fillText(value,x,y,max);};
    const brand=(x=58,y=66,color=light?'#fff':'#111')=>{text('SPORTIQ',x,y,25,color,900);ctx.fillStyle=color;ctx.font='700 14px Arial';ctx.letterSpacing='5px';ctx.fillText('/ PLAYER EDITION',x+145,y,500);ctx.letterSpacing='0px';};
    const statsGrid=(x,y,width,cols=2,rows=items)=>{
      const gap=10, cellW=(width-gap*(cols-1))/cols, cellH=86;
      rows.forEach(([label,value],i)=>{const cx=x+(i%cols)*(cellW+gap),cy=y+Math.floor(i/cols)*(cellH+10);ctx.fillStyle=light?'#ffffff18':'#11111112';ctx.fillRect(cx,cy,cellW,cellH);ctx.fillStyle=accent;ctx.fillRect(cx,cy,4,cellH);text(label.toUpperCase(),cx+14,cy+29,14,subColor,700,cellW-26);text(value,cx+14,cy+65,30,nameColor,900,cellW-26);});
    };
    const footer=(color=light?'#f4dfe3':'#333')=>{ctx.fillStyle=accent;ctx.fillRect(58,1285,784,3);text('YOUR GAME. YOUR NUMBERS.',58,1324,16,color,700,780);};
    if (theme.style==='red') {
      cover(0,100,W,665,.92); const fade=ctx.createLinearGradient(0,500,0,820);fade.addColorStop(0,'#17070b00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,480,W,350);
      brand();text(playerName,58,810,54,'#fff',900,780);text(role,60,852,20,subColor,700,780);text(`${recordLabel} · ${data.matches} MATCHES`,60,930,20,accent,800);statsGrid(60,975,780,3,items);footer();
    } else if (theme.style==='blue') {
      cover(0,0,W,1010,.82);const fade=ctx.createLinearGradient(0,350,0,1050);fade.addColorStop(0,'#06162f00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,330,W,720);
      brand(58,74);text(playerName,58,840,56,'#fff',900,780);text(role,60,884,20,subColor,700);text(`${recordLabel} · ${data.matches} MATCHES`,60,960,19,accent,800);statsGrid(60,990,780,3,items);footer();
    } else if (theme.style==='gold') {
      cover(110,115,680,700,.82);ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(35,35,830,1280);brand(58,80,'#f7e9bd');text(playerName,58,770,58,'#fff',900,780);text(role,60,812,20,'#dec77b',700);text(`${recordLabel} · ${data.matches} MATCHES`,60,865,18,accent,800);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(60,900,780,330);statsGrid(70,922,760,3,items);footer('#e9d38c');
    } else if (theme.style==='sunset') {
      cover(0,0,W,940,.8);const fade=ctx.createLinearGradient(0,400,0,1000);fade.addColorStop(0,'#08152000');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,380,W,620);brand(58,75);text(playerName,58,810,58,'#fff',900,780);text(role,60,852,20,subColor,700);text(`${recordLabel} · ${data.matches} MATCHES`,60,910,19,accent,800);statsGrid(60,940,780,3,items);footer();
    } else if (theme.style==='ice') {
      text(playerName,38,490,100,'#ffffff12',900,820);cover(150,100,600,650,.9);brand(58,75);text(playerName,58,785,54,'#fff',900,780);text(role,60,829,20,subColor,700);text(`${recordLabel} · ${data.matches} MATCHES`,60,890,19,accent,800);ctx.strokeStyle='#66d4ff88';ctx.lineWidth=2;ctx.strokeRect(58,915,784,315);statsGrid(70,930,760,3,items);footer();
    } else if (theme.style==='green') {
      cover(0,0,W,820,.84);const fade=ctx.createLinearGradient(0,500,0,900);fade.addColorStop(0,'#07170d00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,480,W,420);brand();text(playerName,58,780,55,'#fff',900,780);text(role,60,821,20,subColor,700);text(`${recordLabel} · ${data.matches} MATCHES`,60,875,19,accent,800);statsGrid(60,905,780,3,items);footer();
    } else if (theme.style==='fullbleed') {
      cover(0,0,W,H,.96);
      const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#08090a66');shade.addColorStop(.42,'#08090a00');shade.addColorStop(.58,'#08090a55');shade.addColorStop(.72,'#08090ad9');shade.addColorStop(1,'#08090af5');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
      brand(58,72,'#fff');
      text(playerName,58,790,58,'#fff',900,780);text(role,62,832,20,'#f4e9eb',700,760);
      text(`${recordLabel} · ${data.matches} MATCHES`,60,890,19,accent,800,760);
      const cardW=250,gap=17,cardY=925;
      items.forEach(([label,value],i)=>{const x=58+(i%3)*(cardW+gap),y=cardY+Math.floor(i/3)*96;ctx.fillStyle='#101116cf';ctx.beginPath();ctx.roundRect(x,y,cardW,86,14);ctx.fill();ctx.strokeStyle='#ffffff35';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(x,y,cardW,4);text(value,x+16,y+42,29,'#fff',900,cardW-32);text(label.toUpperCase(),x+16,y+67,13,'#f2e8e9',700,cardW-32);});
      text('YOUR GAME. YOUR NUMBERS.',58,1290,16,'#fff',700,780);
    } else {
      cover(0,0,W,830,.94);const fade=ctx.createLinearGradient(0,420,0,835);fade.addColorStop(0,'#10101000');fade.addColorStop(1,'#101010dd');ctx.fillStyle=fade;ctx.fillRect(0,420,W,415);brand(58,72,'#fff');text(playerName,58,735,48,'#fff',900,780);text(role,62,777,18,'#eee',700,760);ctx.fillStyle='#f3f0e9';ctx.fillRect(0,805,W,H-805);text(recordLabel+' · '+data.matches+' MATCHES',60,844,18,'#222',800,780);statsGrid(60,860,780,3,items);text('YOUR GAME. YOUR NUMBERS.',60,1308,15,'#333',700,780);
    }
  }

  function makeDialog() {
    dialog=document.createElement('div');dialog.className='card-template-backdrop';dialog.innerHTML='<section class="card-template-dialog" role="dialog" aria-modal="true" aria-labelledby="card-template-title"><header class="card-template-header"><div><span class="card-template-eyebrow">PLAYER CARD STUDIO</span><h2 id="card-template-title">Choose your template</h2><p>Pick a design to preview and download.</p></div><button type="button" class="card-template-close" aria-label="Close template picker">×</button></header><div class="card-template-grid"></div></section>';
    document.body.append(dialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('.card-template-close'))closeDialog();});
    document.addEventListener('keydown',onKeyDown);
  }
  function closeDialog(){if(!dialog)return;dialog.remove();dialog=null;document.removeEventListener('keydown',onKeyDown);trigger.focus();}
  function onKeyDown(e){if(e.key==='Escape'&&dialog)closeDialog();}

  trigger.addEventListener('click',async()=>{
    if(!dialog)makeDialog();
    const grid=dialog.querySelector('.card-template-grid');grid.replaceChildren();
    const photo=await loadPhoto();
    themes.forEach((theme,index)=>{
      const card=document.createElement('button');card.type='button';card.className='card-template-option';card.setAttribute('aria-label',`Download ${theme.name} template`);
      const preview=document.createElement('canvas');preview.className='card-template-preview';
      const caption=document.createElement('span');caption.className='card-template-caption';caption.innerHTML=`<span><small>DESIGN ${String(index+1).padStart(2,'0')}</small><strong>${theme.name}</strong></span><i aria-hidden="true">↓</i>`;
      drawCard(preview,theme,slides.find(s=>!s.hidden)||slides[0],.32,photo);
      card.append(preview,caption);grid.append(card);
      card.addEventListener('click',async()=>{
        const activeSlide=slides.find(s=>!s.hidden)||slides[0],out=document.createElement('canvas');
        drawCard(out,theme,activeSlide,3,photo);
        const blob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));
        if(!blob)return;
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=`sportiq-${data.username}-${activeSlide.dataset.title.toLowerCase()}-${theme.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`;link.click();
        setTimeout(()=>URL.revokeObjectURL(url),1500);closeDialog();
      });
    });
    dialog.querySelector('.card-template-close').focus();
  });
})();
