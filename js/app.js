const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dk=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const today=()=>dk(Date.now()),uid=()=>Math.random().toString(36).slice(2,9);
const defaults=()=>({goal:'Bloom into my big idea',kan:[{id:'a',t:'Sketch the plan',c:'todo'},{id:'b',t:'Do the first small step',c:'doing'}],notes:[{id:'n',t:'Tiny steps still count 🌱',k:0}],daily:{date:today(),items:[]},pom:{w:25,b:5,h:2},habits:[],logs:[]});
let S=defaults(),hydrating=false;
const save=()=>{if(!hydrating)Store.save(S)};  // saves locally and (if signed in) to Supabase
function toast(m){const t=$('#to');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2200)}
$$('nav .btn').forEach(b=>b.onclick=()=>{$$('nav .btn').forEach(x=>x.classList.toggle('on',x===b));$('#garden').classList.toggle('tabs-hide',b.dataset.tab!=='garden');$('#habits').classList.toggle('tabs-hide',b.dataset.tab!=='habits');scrollTo({top:0})});
/* garden */
const COLS=[['todo','To do'],['doing','Growing'],['done','Bloomed']],NC=['#ffe97a','#ffb3d1','#b8f0d4','#c9bbff','#ffd0a8'];
function goalView(){const all=S.kan.length+S.daily.items.length,done=S.kan.filter(k=>k.c==='done').length+S.daily.items.filter(i=>i.d).length,p=all?done/all:0;
$('#gb').style.width=Math.max(p*100,3)+'%';$('#gt').textContent=all?`${done} of ${all} steps done · ${Math.round(p*100)}%`:'Add a step to start growing.';
const b=$('#bl');b.style.transform=`scale(${.38+.62*p}) rotate(${p*40}deg)`;b.style.opacity=.55+.45*p;b.style.filter=`saturate(${.4+.8*p})`}
function kanView(){$('#kb').innerHTML=COLS.map(([c,n],ci)=>`<div><h3>${n} <span class="muted">${S.kan.filter(k=>k.c===c).length}</span></h3><div class="col" data-c="${c}">${S.kan.filter(k=>k.c===c).map(k=>`<div class="card" draggable="true" data-id="${k.id}">${ci>0?`<button class="x" data-m="-1" aria-label="Move back">‹</button>`:''}<span>${esc(k.t)}</span>${ci<2?`<button class="x" data-m="1" aria-label="Move forward">›</button>`:''}<button class="x" data-del="1" aria-label="Delete">×</button></div>`).join('')||'<div class="empty">Nothing here yet</div>'}</div></div>`).join('')}
function dailyView(){$('#dl').innerHTML=S.daily.items.map(i=>`<div class="item ${i.d?'done':''}"><input class="chk" type="checkbox" data-id="${i.id}" ${i.d?'checked':''} aria-label="Done"><span>${esc(i.t)}</span><button class="x" data-del="${i.id}" aria-label="Delete">×</button></div>`).join('')||'<div class="empty">No goals for today. Add one above.</div>'}
function noteView(){$('#nl').innerHTML=S.notes.map((n,i)=>`<div class="note" style="background:${NC[n.k%5]};--r:${(i%5-2)*1.6}deg" contenteditable="true" data-id="${n.id}">${esc(n.t)}<button class="x" contenteditable="false" data-del="${n.id}" aria-label="Delete note">×</button></div>`).join('')||'<div class="empty">Stick your first note.</div>'}
function gAll(){goalView();kanView();dailyView();noteView();save()}
$('#goal').value=S.goal;$('#goal').oninput=e=>{S.goal=e.target.value;save()};
$('#kf').onsubmit=e=>{e.preventDefault();const v=$('#ki').value.trim();if(!v)return;S.kan.push({id:uid(),t:v,c:'todo'});$('#ki').value='';gAll()};
$('#df').onsubmit=e=>{e.preventDefault();const v=$('#di').value.trim();if(!v)return;S.daily.items.push({id:uid(),t:v,d:false});$('#di').value='';gAll()};
$('#nf').onsubmit=e=>{e.preventDefault();const v=$('#ni').value.trim();if(!v)return;S.notes.push({id:uid(),t:v,k:S.notes.length});$('#ni').value='';gAll()};
$('#kb').onclick=e=>{const c=e.target.closest('.card');if(!c)return;const k=S.kan.find(x=>x.id===c.dataset.id),b=e.target.closest('button');if(!b)return;
if(b.dataset.del)S.kan=S.kan.filter(x=>x!==k);else{const i=COLS.findIndex(x=>x[0]===k.c)+ +b.dataset.m;k.c=COLS[i][0];if(k.c==='done')burst(e.clientX,e.clientY)}gAll()};
let drag=null;$('#kb').ondragstart=e=>{const c=e.target.closest('.card');if(c)drag=c.dataset.id};
$('#kb').ondragover=e=>{const c=e.target.closest('.col');if(c){e.preventDefault();$$('.col').forEach(x=>x.classList.toggle('over',x===c))}};
$('#kb').ondrop=e=>{const c=e.target.closest('.col');if(!c||!drag)return;e.preventDefault();const k=S.kan.find(x=>x.id===drag);k.c=c.dataset.c;if(k.c==='done')burst(e.clientX,e.clientY);drag=null;gAll()};
$('#kb').ondragend=()=>$$('.col').forEach(x=>x.classList.remove('over'));
$('#dl').onchange=e=>{const i=S.daily.items.find(x=>x.id===e.target.dataset.id);i.d=e.target.checked;if(i.d){const r=e.target.getBoundingClientRect();burst(r.x,r.y)}gAll()};
$('#dl').onclick=e=>{const d=e.target.dataset.del;if(d){S.daily.items=S.daily.items.filter(x=>x.id!==d);gAll()}};
$('#nl').onclick=e=>{const d=e.target.dataset.del;if(d){S.notes=S.notes.filter(x=>x.id!==d);gAll()}};
$('#nl').oninput=e=>{const n=S.notes.find(x=>x.id===e.target.dataset.id);if(n){n.t=[...e.target.childNodes].filter(c=>c.nodeType===3).map(c=>c.textContent).join('');save()}};
/* pomodoro */
S.pom.h=S.pom.h||2;let plan=[],idx=0,mode='w',left=0,run=null,doneAll=false;function mkPlan(){plan=[];let t=0;const T=Math.max(1,Math.round(S.pom.h*60));while(t<T){const w=Math.min(S.pom.w,T-t);plan.push({m:'w',s:w*60});t+=w;if(t<T){const b=Math.min(S.pom.b,T-t);plan.push({m:'b',s:b*60});t+=b}}idx=0;doneAll=false;mode=plan[0].m;left=plan[0].s}mkPlan();function planView(){$('#pl').innerHTML=plan.map((p,i)=>`<i class="${p.m} ${i<idx||doneAll?'d':''} ${i===idx&&!doneAll?'c':''}" style="flex:${p.s}"></i>`).join('');const rem=doneAll?0:left+plan.slice(idx+1).reduce((a,p)=>a+p.s,0),fw=plan.filter(p=>p.m==='w').length,cw=plan.slice(0,idx+1).filter(p=>p.m==='w').length;$('#ps').textContent=doneAll?`${fw} focus blocks finished`:`${Math.floor(rem/3600)}h ${Math.floor(rem%3600/60)}m left · focus block ${cw} of ${fw}`}const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const total=()=>plan[idx].s;
function pView(){$('#tm').textContent=fmt(left);$('#rc').style.strokeDashoffset=276.5*(1-left/total());$('#pm').textContent=doneAll?'Session complete':mode==='w'?'Focus':'Break';planView();$('#pp').textContent=run?'Pause':'Play';document.title=(run?fmt(left)+' · ':'')+'bloomline';
$('#tl').textContent=doneAll?'beautifully done':run?(mode==='w'?'stay with it':'rest and stretch'):'paused'}
function beep(){try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.setValueAtTime(.15,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.8)}catch(e){}}
function tick(){left--;if(left<=0){beep();const was=mode;idx++;if(idx>=plan.length){doneAll=true;clearInterval(run);run=null;idx=plan.length-1;left=0;toast('Session complete. Lovely work!');for(let i=0;i<4;i++)burst(innerWidth/2+i*60-90,innerHeight/3)}else{mode=plan[idx].m;left=plan[idx].s;toast(was==='w'?'Focus done. Time for a break!':'Break over. Back to it!');if(was==='w')burst(innerWidth/2,innerHeight/3)}}pView()}
$('#pp').onclick=()=>{if(doneAll)mkPlan();if(run){clearInterval(run);run=null}else run=setInterval(tick,1000);pView()};
$('#pr').onclick=()=>{clearInterval(run);run=null;mkPlan();pView()};
$('#pw').value=S.pom.w;$('#pb').value=S.pom.b;$('#ph').value=S.pom.h;
[['#pw','w',120,1],['#pb','b',60,1],['#ph','h',12,.25]].forEach(([s,k,mx,mn])=>$(s).onchange=e=>{const v=Math.min(mx,Math.max(mn,+e.target.value||mn));e.target.value=v;S.pom[k]=v;if(!run)mkPlan();else toast('New lengths apply after reset');save();pView()});
/* habits */
const done=(d,h,t)=>S.logs.some(l=>l.date===d&&l.h===h&&l.t===t);
function pct(d){let n=0,m=0;S.habits.forEach(h=>h.tasks.forEach(t=>{m++;if(done(d,h.id,t))n++}));return m?n/m:0}
const back=n=>{const d=new Date();d.setDate(d.getDate()-n);return dk(d)};
function hView(){const T=today();
$('#hl').innerHTML=S.habits.map(h=>`<div class="hab"><h3><span>${esc(h.e)} ${esc(h.n)}</span><button class="x" data-dh="${h.id}" aria-label="Delete habit">×</button></h3>${h.tasks.map(t=>`<div class="item ${done(T,h.id,t)?'done':''}"><input class="chk" type="checkbox" data-h="${h.id}" data-t="${esc(t)}" ${done(T,h.id,t)?'checked':''}><span>${esc(t)}</span></div>`).join('')}</div>`).join('')||'<div class="empty">No habits yet. Plant your first one above.</div>';
let st=0;for(let i=pct(T)>=.5?0:1;pct(back(i))>=.5&&i<400;i++)st++;
const wk=[...Array(7)].map((_,i)=>back(6-i)),tot=S.logs.length;
let best='–',bs=-1;S.habits.forEach(h=>{const c=wk.reduce((a,d)=>a+h.tasks.filter(t=>done(d,h.id,t)).length,0);if(c>bs){bs=c;best=h.e+' '+h.n}});
$('#st').innerHTML=[['Today',Math.round(pct(T)*100)+'%','var(--pink)'],['Streak',st+(st===1?' day':' days'),'var(--sun)'],['Check-ins',tot,'var(--mint)'],['Habits',S.habits.length,'var(--lav)']].map(([a,b,c])=>`<div class="stat" style="background:${c}">${a}<b>${b}</b></div>`).join('')+`<div class="stat" style="background:var(--mint)">Top this week<b style="font-size:18px">${esc(best)}</b></div>`;
$('#bars').innerHTML=wk.map(d=>`<div><span>${Math.round(pct(d)*100)}%</span><i style="height:${pct(d)*100}%"></i><span>${new Date(d+'T00:00').toLocaleDateString('en',{weekday:'short'})}</span></div>`).join('');
const d14=[...Array(14)].map((_,i)=>back(13-i));
$('#hm').innerHTML=S.habits.map(h=>`<div>${esc(h.e)} ${esc(h.n)}<div class="heat">${d14.map(d=>{const p=h.tasks.filter(t=>done(d,h.id,t)).length/h.tasks.length;return`<i title="${d}: ${Math.round(p*100)}%" style="${p?`background:rgba(223,196,236,${.25+.75*p})`:''}"></i>`}).join('')}</div></div>`).join('')||'<div class="empty">Charts appear once you add a habit.</div>';
$('#lg').innerHTML=[...S.logs].reverse().slice(0,40).map(l=>{const h=S.habits.find(x=>x.id===l.h);return`<div>${h?esc(h.e):''} <b>${esc(l.t)}</b> <span class="muted">${h?esc(h.n):'removed habit'} · ${new Date(l.ts).toLocaleString('en',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span></div>`}).join('')||'<div class="empty">Check off a habit task and it shows up here.</div>';save()}
$('#hf').onsubmit=e=>{e.preventDefault();const tasks=$('#ht').value.split(/[\n,]/).map(s=>s.trim()).filter(Boolean);S.habits.push({id:uid(),e:$('#he').value||'🌼',n:$('#hn').value.trim(),tasks:tasks.length?tasks:[$('#hn').value.trim()]});$('#hn').value='';$('#ht').value='';toast('Habit planted');hView()};
$('#hl').onchange=e=>{const{h,t}=e.target.dataset,T=today();if(e.target.checked){S.logs.push({ts:Date.now(),date:T,h,t});const r=e.target.getBoundingClientRect();burst(r.x,r.y)}else S.logs=S.logs.filter(l=>!(l.date===T&&l.h===h&&l.t===t));hView()};
$('#hl').onclick=e=>{const d=e.target.dataset.dh;if(d){S.habits=S.habits.filter(x=>x.id!==d);hView()}};

/* ---------- greeting: good morning / afternoon / evening / night ---------- */
const GREET={
  morning:['🌅','Good morning',['Fresh start. Pick one small step to begin.','Let the day bloom, one task at a time.','A little focus now makes the whole day lighter.']],
  afternoon:['☀️','Good afternoon',['Keep going. Small steps add up.','Time for a focus round? Your timer is ready.','Check your goals for today and keep the momentum.']],
  evening:['🌇','Good evening',['Wind down gently. What went well today?','Tick off your habits before the day closes.','Almost there. Finish one more small thing.']]
  /* night:['🌙','Good night',['Time to rest. Tomorrow’s blooms need sleep.','Log your habits, then switch off and recharge.','Be kind to yourself and sleep well.']] */
};
function greet(){
  const d=new Date(),h=d.getHours(),k=h>=5&&h<12?'morning':h>=12&&h<18?'afternoon':h>=18&&h<22?'evening':'night',g=GREET[k];
  const u=Store.user,meta=u&&u.user_metadata&&u.user_metadata.name;
  let name=meta?String(meta).trim():(u?u.email.split('@')[0].replace(/[._-]+/g,' ').trim():'');
  if(!meta&&name)name=name.charAt(0).toUpperCase()+name.slice(1);
  $('#hi').textContent=g[1]+(name?', '+name:'')+'!';
  $('#hs').title=d.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})+' · '+g[2][d.getDate()%3];
}
setInterval(greet,60000);

/* ---------- accounts + sync (Supabase) ---------- */
function hydrate(d){ // load a saved state into the UI
  S=Object.assign(defaults(),d||{});
  if(S.daily.date!==today())S.daily={date:today(),items:S.daily.items.map(i=>({...i,d:false}))}; // daily goals reset each day
  S.pom=Object.assign({w:25,b:5,h:2},S.pom);
  $('#goal').value=S.goal;$('#pw').value=S.pom.w;$('#pb').value=S.pom.b;$('#ph').value=S.pom.h;
  clearInterval(run);run=null;mkPlan();gAll();hView();pView();greet();
}
const authEl=$('#auth'),am=$('#am');
function lock(on){authEl.classList.toggle('on',on);document.body.classList.toggle('locked',on);if(on)setTimeout(()=>$('#ae').focus(),50)}
function who(){$('#who').textContent=Store.user?Store.user.email:'Local mode (not synced)';$('#out').hidden=!Store.user}
function blank(){hydrating=true;hydrate(null);hydrating=false}
async function enter(){hydrating=true;try{hydrate(await Store.load())}finally{hydrating=false}who();lock(false)}
async function authDo(kind){
  const email=$('#ae').value.trim(),pw=$('#ap').value;
  if(!email||pw.length<6){am.textContent='Enter your email and a password of 6+ characters.';return}
  am.textContent='One moment…';
  try{
    const {data,error}=kind==='up'?await Store.signUp(email,pw,$('#an').value.trim()):await Store.signIn(email,pw,$('#an').value.trim());
    if(error){am.textContent=/failed to fetch|network/i.test(error.message)?`Can’t reach Supabase at ${Store.host}. Check the Project URL in js/config.js, that the project isn’t paused, and any ad blocker or VPN.`:error.message;return}
    if(!(data&&data.session)){am.textContent='Check your inbox to confirm your email, then sign in.';return}
    $('#ap').value='';am.textContent='';await enter();
  }catch(e){am.textContent=/failed to fetch|network/i.test(e.message||'')?`Can’t reach Supabase at ${Store.host}. Check the Project URL in js/config.js and your connection.`:'Something went wrong. Please try again.'}
}
$('#af').onsubmit=e=>{e.preventDefault();authDo('in')};
$('#aup').onclick=()=>authDo('up');
$('#out').onclick=async()=>{await Store.signOut();blank();who();lock(true)};
(async function boot(){
  blank();
  if(!Store.enabled){await enter();return}   // no Supabase keys yet: run locally in this browser
  Store.onAuth(ev=>{if(ev==='SIGNED_OUT'&&!authEl.classList.contains('on')){blank();who();lock(true)}});
  if(await Store.session())await enter();else{who();lock(true)}
})();
