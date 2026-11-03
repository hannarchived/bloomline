/* floating bubbles + dandelions */
const cv=$('#fx'),cx=cv.getContext('2d');let W,H,P=[],mx=-999,my=-999,DPR=Math.min(devicePixelRatio||1,2);
function rs(){W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',rs);rs();
const R=(a,b)=>a+Math.random()*(b-a),HUES=[330,200,160,270,40];
const mk=(k,x,y)=>({k,x:x??R(0,W),y:y??R(0,H),r:k==='b'?R(10,30):R(20,30),vx:R(-.2,.2),vy:k==='b'?-R(.2,.6):-R(.1,.3),h:HUES[Math.random()*5|0],a:R(0,6),life:1});
for(let i=0;i<6;i++)P.push(mk('b'));for(let i=0;i<2;i++)P.push(mk('d'));
let AC;function popSnd(f){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.frequency.setValueAtTime(f,AC.currentTime);o.frequency.exponentialRampToValueAtTime(f/4,AC.currentTime+.09);g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.1);o.start();o.stop(AC.currentTime+.1)}catch(e){}}
function popB(p){popSnd(700+p.r*8);P.push({k:'r',x:p.x,y:p.y,r:p.r,h:p.h,life:1},{k:'r',x:p.x,y:p.y,r:p.r*.5,h:p.h,life:.8});for(let i=0;i<12;i++){const a=i/12*6.28+R(0,.4),s=R(2,5);P.push({k:'p',x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.5,r:R(2,5),h:p.h,life:1})}}
function petalBurst(p){popSnd(450);seeds(p);seeds(p)}
function burst(x,y){for(let i=0;i<14;i++){const a=R(0,6.28),s=R(1,4);P.push({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:R(2,5),h:HUES[i%5],life:1})}}
function seeds(p){for(let i=0;i<16;i++){const a=i/16*6.28;P.push({k:'s',x:p.x+Math.cos(a)*p.r*.6,y:p.y+Math.sin(a)*p.r*.6,vx:Math.cos(a)*R(.4,1.6)+R(0,1.5),vy:Math.sin(a)*R(.4,1.6)-R(.2,.8),r:R(10,16),a:a,life:1})}}
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY});addEventListener('pointerleave',()=>{mx=-999});
addEventListener('pointerdown',e=>{if(e.target.closest('button,input,textarea,select,a,[contenteditable],label,.card,.item,.auth'))return;
for(let i=P.length-1;i>=0;i--){const p=P[i];if((p.k==='b'||p.k==='d')&&Math.hypot(p.x-e.clientX,p.y-e.clientY)<p.r+8){if(p.k==='d')petalBurst(p);else popB(p);P.splice(i,1);P.push(mk(p.k,R(0,W),H+50));return}}
P.push(mk('b',e.clientX,e.clientY));burst(e.clientX,e.clientY)});
function draw(){cx.clearRect(0,0,W,H);
for(let i=P.length-1;i>=0;i--){const p=P[i];
if(p.k==='b'||p.k==='d'){const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);if(d<130){p.vx+=dx/d*.12;p.vy+=dy/d*.12}p.vx*=.985;p.vy=p.vy*.985+(p.k==='b'?-.004:-.002);p.a+=.01;p.x+=p.vx+Math.sin(p.a)*.4;p.y+=p.vy;
if(p.y<-60||p.x<-60||p.x>W+60){p.y=H+50;p.x=R(0,W);p.vy=-R(.2,.6);p.vx=R(-.2,.2)}if(p.y>H+120)p.y=-50}
else{p.x+=p.vx;p.y+=p.vy;if(p.k==='p'){p.vy+=.08;p.life-=.025}else if(p.k==='r'){p.vx=p.vy=0;p.r+=3.2;p.life-=.05}else if(p.k==='l'){p.vx*=.985;p.vy=p.vy*.97+.03;p.a+=p.va;p.x+=Math.sin(p.life*9+p.h)*.7;p.life-=.007}else{const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);if(d<110){p.vx+=dx/d*.15;p.vy+=dy/d*.15}p.vx=p.vx*.99+.02;p.vy=p.vy*.99-.006;p.a+=.02;p.life-=.0025}
if(p.life<=0){P.splice(i,1);continue}}
cx.save();cx.translate(p.x,p.y);cx.globalAlpha=Math.min(1,p.life)*(p.k==='b'||p.k==='d'?.5:p.k==='s'?.7:1);
if(p.k==='b'){const g=cx.createRadialGradient(-p.r*.35,-p.r*.4,p.r*.05,0,0,p.r);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(.5,`hsla(${p.h},90%,85%,.04)`);g.addColorStop(.9,`hsla(${p.h},90%,75%,.14)`);g.addColorStop(1,'rgba(255,255,255,.55)');cx.fillStyle=g;cx.beginPath();cx.arc(0,0,p.r,0,6.28);cx.fill();cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=1;cx.stroke()}
else if(p.k==='d'){cx.rotate(p.a*.5);cx.strokeStyle='rgba(255,255,255,.9)';cx.fillStyle='rgba(255,255,255,.9)';cx.lineWidth=.7;for(let j=0;j<18;j++){const a=j/18*6.28,x=Math.cos(a)*p.r,y=Math.sin(a)*p.r;cx.beginPath();cx.moveTo(0,0);cx.lineTo(x,y);cx.stroke();cx.beginPath();cx.arc(x,y,1.8,0,6.28);cx.fill()}cx.fillStyle='#ffd35a';cx.beginPath();cx.arc(0,0,4,0,6.28);cx.fill()}
else if(p.k==='s'){cx.rotate(p.a);cx.strokeStyle='#fff';cx.fillStyle='#fff';cx.lineWidth=.8;cx.beginPath();cx.moveTo(0,0);cx.lineTo(p.r,0);cx.stroke();for(let j=-2;j<=2;j++){cx.beginPath();cx.moveTo(p.r,0);cx.lineTo(p.r+6,j*3);cx.stroke()}cx.beginPath();cx.arc(0,0,1.8,0,6.28);cx.fill()}
else if(p.k==='r'){cx.strokeStyle=`hsla(${p.h},90%,88%,.95)`;cx.lineWidth=3*p.life;cx.beginPath();cx.arc(0,0,p.r,0,6.28);cx.stroke()}else if(p.k==='l'){cx.rotate(p.a);cx.fillStyle=`hsl(${335+p.h%30},90%,${82+p.h%12}%)`;cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=1;cx.beginPath();cx.ellipse(0,0,p.r,p.r*.52,0,0,6.28);cx.fill();cx.stroke()}else{cx.fillStyle=`hsl(${p.h},95%,75%)`;cx.beginPath();cx.arc(0,0,p.r,0,6.28);cx.fill()}
cx.restore()}
requestAnimationFrame(draw)}
if(matchMedia('(prefers-reduced-motion:reduce)').matches){P=P.filter(p=>p.k!=='b'||p.r<20)}
draw();
