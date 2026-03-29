function getBookmarkletCode() {
  return `javascript:(function(){
    var PANEL_ID='__sl_panel__',GHOST_ID='__sl_ghost__',SNAP_ID='__sl_snap__';
    function parseRGB(s){if(!s)return null;var m=s.match(/rgba?\\(\\s*(\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/);return m?{r:+m[1],g:+m[2],b:+m[3]}:null;}
    function lum(r,g,b){return [r,g,b].reduce(function(a,v,i){v/=255;v=v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);return a+v*[0.2126,0.7152,0.0722][index=i];},0);}
    function cr(l1,l2){var hi=Math.max(l1,l2),lo=Math.min(l1,l2);return(hi+0.05)/(lo+0.05);}
    function mul8(v){return v%8===0;}
    function cs(el,p){return getComputedStyle(el).getPropertyValue(p).trim();}
    function cn(el,p){return parseFloat(cs(el,p))||0;}
    var panel=document.getElementById(PANEL_ID);
    if(panel){panel.remove();var ss=document.getElementById(SNAP_ID);if(ss)ss.remove();var gs=document.getElementById(GHOST_ID);if(gs)gs.remove();document.querySelectorAll('[class*=__sl_s_]').forEach(function(el){Array.from(el.classList).filter(function(c){return c.startsWith('__sl_s_');}).forEach(function(c){el.classList.remove(c);});});return;}
    var allEls=Array.from(document.querySelectorAll('*'));
    var snapCSS='';var snapStyle=document.createElement('style');snapStyle.id=SNAP_ID;
    var spIssues=[],ctIssues=[],a11yIssues=[];
    allEls.forEach(function(el,i){
      if(el.id===PANEL_ID||el.id===SNAP_ID||el.id===GHOST_ID)return;
      var props=['margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left'];
      var bad=false;
      props.forEach(function(p){var v=cn(el,p);if(v!==0&&!mul8(Math.round(v)))bad=true;});
      if(bad){var cls='__sl_s_'+i;el.classList.add(cls);snapCSS+='.'+cls+'{outline:2px solid #ff4757!important;outline-offset:1px;}';spIssues.push({tag:el.tagName.toLowerCase(),id:el.id,cls:(el.className+'').split(' ').filter(function(c){return c&&!c.startsWith('__sl_');}).slice(0,2).join(' ')});}
    });
    allEls.forEach(function(el){
      var hasText=Array.from(el.childNodes).some(function(n){return n.nodeType===3&&(n.textContent||'').trim().length>0;});
      if(!hasText)return;
      var fg=parseRGB(cs(el,'color'));
      var bgStr=cs(el,'background-color');
      var bg=parseRGB(bgStr);
      if(!fg||!bg)return;
      if(bg.r===0&&bg.g===0&&bg.b===0&&bgStr.indexOf('rgba(0, 0, 0, 0)')!==-1)return;
      var ratio=cr(lum(fg.r,fg.g,fg.b),lum(bg.r,bg.g,bg.b));
      if(ratio<4.5)ctIssues.push({tag:el.tagName.toLowerCase(),ratio:ratio.toFixed(2),text:(el.textContent||'').trim().slice(0,45)});
    });
    document.querySelectorAll('img').forEach(function(img){if(!img.getAttribute('alt'))a11yIssues.push({type:'Missing alt',el:'<img src="'+(img.src||'').slice(0,60)+'">'});});
    document.querySelectorAll('input,textarea,select').forEach(function(inp){var id=inp.getAttribute('id');var hasLabel=id&&document.querySelector('label[for="'+id+'"]');var hasAria=inp.getAttribute('aria-label')||inp.getAttribute('aria-labelledby');if(!hasLabel&&!hasAria)a11yIssues.push({type:'Missing label',el:'<'+inp.tagName.toLowerCase()+' type="'+(inp.getAttribute('type')||'')+'">'});});
    snapStyle.textContent=snapCSS;document.head.appendChild(snapStyle);
    var report={timestamp:new Date().toISOString(),url:location.href,summary:{spacing:spIssues.length,contrast:ctIssues.length,accessibility:a11yIssues.length},spacingIssues:spIssues,contrastIssues:ctIssues,accessibilityIssues:a11yIssues};
    function issueRows(r){
      var h='';
      if(r.spacingIssues.length){h+='<p style="color:#ff4757;font-weight:800;margin:8px 0 5px;font-size:12px">📐 Spacing Issues</p>';r.spacingIssues.slice(0,8).forEach(function(s){h+='<div style="background:#16213e;border-left:3px solid #ff4757;padding:5px 9px;margin-bottom:4px;border-radius:0 7px 7px 0;font-size:11px">&lt;'+s.tag+'&gt; '+(s.id?'#'+s.id:s.cls?'.'+s.cls:'')+'</div>';});if(r.spacingIssues.length>8)h+='<div style="font-size:11px;color:#888;margin-bottom:5px">+ '+(r.spacingIssues.length-8)+' more…</div>';}
      if(r.contrastIssues.length){h+='<p style="color:#c44dff;font-weight:800;margin:8px 0 5px;font-size:12px">👁️ Contrast Issues</p>';r.contrastIssues.slice(0,6).forEach(function(c){h+='<div style="background:#16213e;border-left:3px solid #c44dff;padding:5px 9px;margin-bottom:4px;border-radius:0 7px 7px 0;font-size:11px">Ratio '+c.ratio+' — "'+c.text.slice(0,32)+'"</div>';});if(r.contrastIssues.length>6)h+='<div style="font-size:11px;color:#888;margin-bottom:5px">+ '+(r.contrastIssues.length-6)+' more…</div>';}
      if(r.accessibilityIssues.length){h+='<p style="color:#ffd32a;font-weight:800;margin:8px 0 5px;font-size:12px">♿ Accessibility Issues</p>';r.accessibilityIssues.slice(0,6).forEach(function(a){h+='<div style="background:#16213e;border-left:3px solid #ffd32a;padding:5px 9px;margin-bottom:4px;border-radius:0 7px 7px 0;font-size:11px"><span style="color:#ffd32a">'+a.type+'</span>: '+a.el+'</div>';});}
      if(!h)h='<div style="text-align:center;padding:24px 0;color:#4ecdc4;font-weight:800;font-size:13px">✦ No issues found — great work! ✦</div>';
      return h;
    }
    var p=document.createElement('div');p.id=PANEL_ID;
    p.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;width:340px;max-height:82vh;overflow-y:auto;background:#1a1a2e;color:#eee;border-radius:16px;border:2px solid #ff6b9d;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 8px 36px rgba(255,107,157,.35)';
    p.innerHTML='<div style="background:linear-gradient(135deg,#ff6b9d,#c44dff);padding:14px 16px;border-radius:14px 14px 0 0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:1"><span style="font-weight:800;font-size:15px;letter-spacing:.5px">✦ StarLint</span><button id="__sl_x__" style="background:rgba(255,255,255,.25);border:none;color:#fff;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:14px;line-height:1">✕</button></div><div style="padding:14px 16px"><div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap"><span style="background:#ff4757;padding:3px 11px;border-radius:99px;font-size:11px;font-weight:700">📐 '+report.summary.spacing+' spacing</span><span style="background:#c44dff;padding:3px 11px;border-radius:99px;font-size:11px;font-weight:700">👁️ '+report.summary.contrast+' contrast</span><span style="background:#ffd32a;color:#333;padding:3px 11px;border-radius:99px;font-size:11px;font-weight:700">♿ '+report.summary.accessibility+' a11y</span></div><button id="__sl_g__" style="width:100%;background:#16213e;border:1.5px solid #ff6b9d;color:#ff6b9d;padding:9px;border-radius:10px;cursor:pointer;margin-bottom:10px;font-size:12px;font-weight:700">👻 Toggle Ghost Layout</button><div style="max-height:310px;overflow-y:auto">'+issueRows(report)+'</div><div style="display:flex;gap:8px;margin-top:13px"><button id="__sl_j__" style="flex:1;background:#ff6b9d;border:none;color:#fff;padding:9px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700">⬇ Export JSON</button><button id="__sl_n__" style="flex:1;background:#c44dff;border:none;color:#fff;padding:9px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700">📋 View Report</button></div></div>';
    document.body.appendChild(p);
    var ghost=false;
    document.getElementById('__sl_x__').addEventListener('click',function(){p.remove();var ss=document.getElementById(SNAP_ID);if(ss)ss.remove();var gs=document.getElementById(GHOST_ID);if(gs)gs.remove();document.querySelectorAll(\'[class*=__sl_s_]\').forEach(function(el){Array.from(el.classList).filter(function(c){return c.startsWith(\'__sl_s_\');}).forEach(function(c){el.classList.remove(c);});});});
    document.getElementById('__sl_g__').addEventListener('click',function(){ghost=!ghost;if(ghost){var gs=document.createElement('style');gs.id=GHOST_ID;gs.textContent='*:not([id^=__dl]):not([id^=__dl] *){outline:1px solid rgba(255,20,147,.35)!important}';document.head.appendChild(gs);this.style.background='#ff6b9d';this.style.color='#1a1a2e';}else{var eg=document.getElementById(GHOST_ID);if(eg)eg.remove();this.style.background='#16213e';this.style.color='#ff6b9d';}});
    document.getElementById('__sl_j__').addEventListener('click',function(){var b=new Blob([JSON.stringify(report,null,2)],{type:\'application/json\'});var u=URL.createObjectURL(b);var a=document.createElement(\'a\');a.href=u;a.download=\'starlint-report.json\';a.click();URL.revokeObjectURL(u);});
    document.getElementById('__sl_n__').addEventListener('click',function(){
      var lines=['StarLint Audit Report','========================','Generated : '+report.timestamp,'Page URL  : '+report.url,'','Summary','-------','Spacing issues  : '+report.summary.spacing,'Contrast issues : '+report.summary.contrast,'A11y issues     : '+report.summary.accessibility];
      if(spIssues.length){lines.push('','Spacing Issues (not a multiple of 8 px)','---------------------------------------');spIssues.forEach(function(s,i){lines.push((i+1)+'. <'+s.tag+'>'+(s.id?' #'+s.id:s.cls?' .'+s.cls:\'\'));});}
      if(ctIssues.length){lines.push('','Contrast Issues (ratio below 4.5:1)','------------------------------------');ctIssues.forEach(function(c,i){lines.push((i+1)+'. Ratio '+c.ratio+' — "'+c.text+'"');});}
      if(a11yIssues.length){lines.push('','Accessibility Issues','--------------------');a11yIssues.forEach(function(a,i){lines.push((i+1)+'. '+a.type+': '+a.el);});}
      var w=window.open(\'\',\'_blank\',\'width=720,height=620\');
      if(!w)return;
      w.document.write(\'<!DOCTYPE html><html><head><title>StarLint Report</title><style>body{background:#1a1a2e;color:#d0d0e8;font-family:monospace;padding:32px;white-space:pre-wrap;}</style></head><body><h1>✦ StarLint Report</h1>\' + lines.join(\'\\n\') + \'</body></html>\');
      w.document.close();
    });
  })();`;
}

function setupBookmarkletLink(code) {
  const link = document.getElementById("bookmarklet-link");
  if (!link) return;
  link.href = "javascript:" + code;
  
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
}

const RESET_LABEL = "Copy code instead";
const SUCCESS_LABEL = "✓ Copied!";
const RESET_DELAY = 2200;

function setupCopyButton(code) {
	const btn = document.getElementById("copy-btn");
	if (!btn) {
		return;
	}
	btn.addEventListener("click", () => {
		navigator.clipboard.writeText(code).then(() => {
			btn.textContent = SUCCESS_LABEL;
			btn.classList.add("copied");
			setTimeout(() => {
				btn.textContent = RESET_LABEL;
				btn.classList.remove("copied");
			}, RESET_DELAY);
		});
	});
}
function initBookmarklet() {
	const code = getBookmarkletCode();
	setupBookmarkletLink(code);
	setupCopyButton(code);
}
const SHADOW_ON = "0 2px 20px rgba(196, 77, 255, 0.15)";
const SHADOW_OFF = "none";
const SCROLL_THRESHOLD = 10;
function initScrollShadow() {
	const navbar = document.getElementById("navbar");
	if (!navbar) {
		return;
	}
	window.addEventListener(
		"scroll",
		() => {
			const pastThreshold = window.scrollY > SCROLL_THRESHOLD;
			navbar.style.boxShadow = pastThreshold ? SHADOW_ON : SHADOW_OFF;
		},
		{ passive: true },
	);
}
function initHamburger() {
	const hamburger = document.getElementById("hamburger");
	const mobileMenu = document.getElementById("mobile-menu");
	if (!hamburger || !mobileMenu) {
		return;
	}
	hamburger.addEventListener("click", () => {
		mobileMenu.classList.toggle("open");
	});
	mobileMenu.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			mobileMenu.classList.remove("open");
		});
	});
}
function initNavbar() {
	initScrollShadow();
	initHamburger();
}
const SEARCH_ICON = `
  <svg
    width="20" height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
`;
function createFAB(onClickCallback) {
	const btn = document.createElement("button");
	btn.id = "sl-fab";
	btn.setAttribute("aria-label", "Audit this page");
	btn.innerHTML = `
    ${SEARCH_ICON}
    <span class="fab-label">Audit this page</span>
  `;
	btn.addEventListener("click", onClickCallback);
	return btn;
}
function initFab(onAudit) {
	const fab = createFAB(onAudit);
	document.body.appendChild(fab);
}

window.getBookmarkletCode = getBookmarkletCode;
window.initBookmarklet = initBookmarklet;
window.initNavbar = initNavbar;
window.initFab = initFab;

export { 
  initNavbar as a, 
  initFab as b, 
  initBookmarklet as i 
};
