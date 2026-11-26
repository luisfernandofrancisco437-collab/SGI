'use strict';
(()=>{
 const endpoint='https://xwettgyajktagtqpbpnk.supabase.co/rest/v1/rpc/crm_owner_submit';
 // Publishable key only; the invitation authorizes a single submission, not a read.
 const key='sb_publishable_cKBbdWh4OxWszwhxyovnvw_Of8QEfD6';
 const $=id=>document.getElementById(id),form=$('form'),msg=$('status');
 const invite=new URLSearchParams(location.hash.slice(1)).get('convite');
 if(!/^[a-f0-9]{64}$/.test(invite||'')){msg.textContent='Abra o link completo recebido do corretor. Esta página precisa de um convite.';return;}
 form.hidden=false;msg.textContent='';
 form.elements.op.onchange=()=>{const both=form.elements.op.value==='Locação e Venda';$('sale').hidden=!both;form.elements.valorVenda.required=both;if(!both)form.elements.valorVenda.value='';$('price').textContent=form.elements.op.value.includes('Locação')?'Aluguel mensal (R$) *':'Preço pretendido (R$) *';};
 async function photo(file){
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('Selecione fotos JPEG, PNG ou WebP de até 12 MB.');
   const url=URL.createObjectURL(file),im=new Image();
   try{im.src=url;await im.decode();const c=document.createElement('canvas'),scale=Math.min(1,1400/Math.max(im.width,im.height));
     for(const ratio of [1,.75,.5]){
       c.width=Math.max(1,Math.round(im.width*scale*ratio));c.height=Math.max(1,Math.round(im.height*scale*ratio));
       const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);
       const jpg=c.toDataURL('image/jpeg',.78).split(',')[1];if(jpg&&jpg.length<=530000)return jpg;
     }throw Error('Uma foto ficou grande demais. Escolha uma imagem menor.');
   }finally{URL.revokeObjectURL(url);}
 }
 let busy=false;
 form.onsubmit=async ev=>{ev.preventDefault();if(busy)return;busy=true;$('submit').disabled=true;
   try{
     const fields=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,v.trim().replace(/\s+/g,' ').replace(/'/g,'’').replace(/"/g,'”')]));
     if(Object.values(fields).some(v=>/[<>&`\\]/.test(v)))throw Error('Substitua os sinais <, >, &, barra invertida ou acento grave por texto antes de enviar.');
     fields.tel=fields.tel.replace(/\D/g,'');if(!/^(55)?[1-9]\d{9,10}$/.test(fields.tel))throw Error('Informe um telefone brasileiro com DDD.');
     const files=[...$('photos').files];if(files.length>6)throw Error('Selecione no máximo seis fotos.');
     const pictures=[];for(const file of files){msg.textContent='Preparando foto '+(pictures.length+1)+' de '+files.length+'…';pictures.push(await photo(file));}
     msg.textContent='Enviando. Aguarde a confirmação…';
     const res=await fetch(endpoint,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({invite,fields,pictures}),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(60000)});
     const data=await res.json();if(!res.ok||!data.received)throw Error(data.code==='P0001'?data.message:'O envio não foi confirmado. Confira o link com o corretor e tente novamente.');
     form.hidden=true;form.reset();msg.textContent=data.alreadyReceived?'Este convite já teve um cadastro recebido. Para outro imóvel, peça um novo link.':'Cadastro recebido. Seu imóvel está aguardando revisão pelo corretor.';
   }catch(e){msg.textContent=e instanceof TypeError||e.name==='TimeoutError'?'A conexão não confirmou o envio. Tente novamente com o mesmo convite.':e.message;}
   finally{busy=false;$('submit').disabled=false;}
 };
})();
