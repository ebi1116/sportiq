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
    {name:'Stat Poster', style:'statposter', colors:['#f0eee9','#202020','#ed1c2e'], ink:'#151515'},
    {name:'Profile Poster', style:'profileposter', colors:['#f4f2ed','#dedbd4','#ed1c2e'], ink:'#151515'}
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
    const title = slide.dataset.title.toUpperCase();
    const stats = [...slide.querySelectorAll('.player-stat')].map(tile => [tile.querySelector('span').textContent.trim(), tile.querySelector('strong').textContent.trim()]);
    const opponents = [...slide.querySelectorAll('.opponent-row')].map(row => [row.querySelector('.opponent-team strong').textContent.trim(), row.querySelector('.opponent-runs').textContent.trim().replace(/\s+/g,' ')]);
    const items = (stats.length ? stats : opponents).slice(0,5);
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
      const gap=14, cellW=(width-gap*(cols-1))/cols, cellH=104;
      rows.forEach(([label,value],i)=>{const cx=x+(i%cols)*(cellW+gap),cy=y+Math.floor(i/cols)*(cellH+14);ctx.fillStyle=light?'#ffffff18':'#11111112';ctx.fillRect(cx,cy,cellW,cellH);ctx.fillStyle=accent;ctx.fillRect(cx,cy,4,cellH);text(label.toUpperCase(),cx+17,cy+34,16,subColor,700,cellW-32);text(value,cx+17,cy+78,35,nameColor,900,cellW-32);});
    };
    const footer=(color=light?'#f4dfe3':'#333')=>{ctx.fillStyle=accent;ctx.fillRect(58,1285,784,3);text('YOUR GAME. YOUR NUMBERS.',58,1324,16,color,700,780);};
    if (theme.style==='red') {
      cover(0,100,W,665,.92); const fade=ctx.createLinearGradient(0,500,0,820);fade.addColorStop(0,'#17070b00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,480,W,350);
      brand();text(playerName,58,810,54,'#fff',900,780);text(role,60,852,20,subColor,700,780);text(`${data.matches} MATCHES PLAYED`,60,930,23,accent,800);statsGrid(60,975,780,2,items.slice(0,4));footer();
    } else if (theme.style==='blue') {
      cover(0,0,W,1010,.82);const fade=ctx.createLinearGradient(0,350,0,1050);fade.addColorStop(0,'#06162f00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,330,W,720);
      brand(58,74);text(playerName,58,840,56,'#fff',900,780);text(role,60,884,20,subColor,700);text(`${data.matches} MATCHES PLAYED`,60,960,22,accent,800);statsGrid(60,1000,780,2,items.slice(0,4));footer();
    } else if (theme.style==='mono') {
      ctx.fillStyle='#f4f1e9';ctx.fillRect(0,0,W,H);cover(255,125,645,540,.9);brand(55,72,'#171717');text(data.playerName.split(' ')[0].toUpperCase(),55,410,66,'#d52d32',900,430);text(data.playerName.split(' ').slice(1).join(' ').toUpperCase(),55,475,62,'#171717',900,470);text(role,58,520,17,'#444',700,460);ctx.fillStyle='#e2ded5';ctx.fillRect(0,700,W,2);text(`${data.matches} MATCHES`,58,780,24,'#171717',900);items.forEach(([label,value],i)=>{const x=58+i*166;ctx.fillStyle='#171717';ctx.fillRect(x,840,148,190);text(value,x+12,930,37,'#171717',900,130);text(label.toUpperCase(),x+12,974,14,'#555',700,130);});footer('#333');
    } else if (theme.style==='gold') {
      cover(110,115,680,700,.82);ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(35,35,830,1280);brand(58,80,'#f7e9bd');text(playerName,58,850,58,'#fff',900,780);text(role,60,894,20,'#dec77b',700);text(`${data.matches} MATCHES PLAYED`,60,967,20,accent,800);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(60,1000,780,220);items.slice(0,5).forEach(([label,value],i)=>{const x=75+i*153;text(value,x,1090,31,'#fff',900,140);text(label.toUpperCase(),x,1130,12,'#e9d38c',700,140);});footer('#e9d38c');
    } else if (theme.style==='sunset') {
      cover(0,0,W,940,.8);const fade=ctx.createLinearGradient(0,400,0,1000);fade.addColorStop(0,'#08152000');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,380,W,620);brand(58,75);text(playerName,58,850,58,'#fff',900,780);text(role,60,892,20,subColor,700);text(`${data.matches} MATCHES PLAYED`,60,970,21,accent,800);statsGrid(60,1010,780,4,items.slice(0,4));footer();
    } else if (theme.style==='ice') {
      text(playerName,38,490,100,'#ffffff12',900,820);cover(150,100,600,650,.9);brand(58,75);text(playerName,58,820,54,'#fff',900,780);text(role,60,864,20,subColor,700);text(`${data.matches} MATCHES PLAYED`,60,930,22,accent,800);ctx.strokeStyle='#66d4ff88';ctx.lineWidth=2;ctx.strokeRect(58,970,784,250);items.slice(0,5).forEach(([label,value],i)=>{const x=72+i*153;text(value,x,1065,31,'#fff',900,140);text(label.toUpperCase(),x,1107,12,'#b6e8ff',700,140);});footer();
    } else if (theme.style==='green') {
      cover(0,0,W,820,.84);const fade=ctx.createLinearGradient(0,500,0,900);fade.addColorStop(0,'#07170d00');fade.addColorStop(1,dark);ctx.fillStyle=fade;ctx.fillRect(0,480,W,420);brand();text(playerName,58,875,55,'#fff',900,780);text(role,60,916,20,subColor,700);text(`${data.matches} MATCHES PLAYED`,60,984,21,accent,800);statsGrid(60,1020,780,4,items.slice(0,4));footer();
    } else if (theme.style==='statposter') {
      cover(0,0,W,H,.96);
      const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#08090acc');shade.addColorStop(.38,'#08090a1c');shade.addColorStop(.62,'#08090a55');shade.addColorStop(1,'#08090af2');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
      brand(58,75,'#fff');ctx.fillStyle=accent;ctx.fillRect(58,700,112,6);
      text(playerName,58,790,58,'#fff',900,780);text(role,62,832,20,'#f1e9e9',700,760);
      text(`${data.matches} MATCHES PLAYED`,60,900,21,accent,800,760);
      const cardW=145,gap=13,cardY=950,cardH=235;
      items.slice(0,5).forEach(([label,value],i)=>{const x=58+i*(cardW+gap);ctx.fillStyle='#111214c9';ctx.beginPath();ctx.roundRect(x,cardY,cardW,cardH,16);ctx.fill();ctx.fillStyle=accent;ctx.fillRect(x,cardY,cardW,5);text(value,x+13,cardY+100,38,'#fff',900,cardW-26);ctx.fillStyle='#ffffff55';ctx.fillRect(x+13,cardY+119,cardW-26,1);text(label.toUpperCase(),x+13,cardY+151,14,'#f2e8e9',700,cardW-26);});
      text('YOUR GAME. YOUR NUMBERS.',58,1290,16,'#fff',700,780);
    } else if (theme.style==='profileposter') {
      ctx.save();ctx.filter='grayscale(1)';cover(0,0,W,H,.72);ctx.restore();
      const header=ctx.createLinearGradient(0,0,0,260);header.addColorStop(0,'#f4f2edee');header.addColorStop(1,'#f4f2ed00');ctx.fillStyle=header;ctx.fillRect(0,0,W,260);
      brand(52,72,'#171717');
      const panel=ctx.createLinearGradient(0,690,0,H);panel.addColorStop(0,'#f4f2ede0');panel.addColorStop(1,'#f4f2edf5');ctx.fillStyle=panel;ctx.fillRect(0,690,W,660);
      text(playerName,58,845,62,accent,900,780);text(role,62,888,20,'#222',700,760);ctx.fillStyle=accent;ctx.fillRect(60,915,130,5);
      text(`${title} / CAREER RECORD`,60,970,19,'#252525',800,780);
      ctx.fillStyle='#ffffffd9';ctx.beginPath();ctx.roundRect(38,1000,824,235,22);ctx.fill();
      items.slice(0,5).forEach(([label,value],i)=>{const x=52+i*160;if(i){ctx.fillStyle='#17171733';ctx.fillRect(x-8,1025,1,180);}text(value,x,1115,34,'#171717',900,145);text(label.toUpperCase(),x,1155,13,'#444',700,145);});
      text('YOUR GAME. YOUR NUMBERS.',248,1305,16,'#222',700,500);
    } else {
      ctx.fillStyle='#f3f0e9';ctx.fillRect(480,0,420,H);cover(0,0,520,H,.94);ctx.fillStyle='#171717';ctx.fillRect(495,0,405,H);brand(545,70,'#fff');text(playerName,545,205,40,'#fff',900,310);text(role,547,245,16,'#e1d9cf',700,310);items.slice(0,5).forEach(([label,value],i)=>{const y=300+i*174;ctx.fillStyle='#292929';ctx.fillRect(530,y,340,145);ctx.fillStyle=accent;ctx.fillRect(530,y,6,145);text(value,555,y+63,40,'#fff',900,290);text(label.toUpperCase(),555,y+105,16,'#e9dfe0',700,285);});ctx.fillStyle='#f4f1e9';ctx.fillRect(0,1040,520,310);text(playerName,40,1120,32,'#171717',900,450);text(`${data.matches} MATCHES PLAYED`,42,1170,18,'#444',700,450);text('YOUR GAME. YOUR NUMBERS.',42,1280,14,'#444',700,450);
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
