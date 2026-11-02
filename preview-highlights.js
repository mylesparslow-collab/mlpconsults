/* PREVIEW ONLY (branch preview-all). Marks every changed spot in red. Never merge to main. */
(function(){
var path=location.pathname.replace(/\/+$/,'');
var items;
if(path.indexOf('/dash')===0){
 items=[['#prices','New price list: ranges, Front Office tiers, monthly plans, rules of thumb (PR #8)']];
}else{
 items=[
 ['#menu','Mobile menu button (PR #11)'],
 ['.hero .note','Location added: Irvine, CA & remote (PR #11)'],
 ['#services h3:nth-of-type(1)','',1],
 ['#how .head','How it works: new headline and subline (PR #11)'],
 ['.quick','Quick Win: new wording and a "Claim" button (PR #11)'],
 ['.founding','Case-study rate wording (PR #11)'],
 ['#case-remodeler','Case study rewritten: status list, decisions, what we will measure (PR #10)'],
 ['#case-brokerage .demos','Live demo links (PR #9)'],
 ['#case-sites .demos, #case-sites .fine','Sample sites now link to live versions (PR #9)'],
 ['#case-system .demos','Live dashboard link (PR #9)'],
 ['#referrals','New referral program section (PR #10)'],
 ['#f-ref','Referred-by placeholder text (PR #10)'],
 ['footer a[href="#referrals"]','Footer Referrals link (PR #10)']
 ];
 document.querySelectorAll('.ind').forEach(function(e){if(/Law firms/.test(e.textContent))items.push([null,'Law firms wording (PR #11)',0,e]);});
 document.querySelectorAll('#services h3').forEach(function(e){if(/structured for AI/.test(e.textContent))items.push([null,'Google / AI search wording (PR #11)',0,e.parentNode]);});
 document.querySelectorAll('.hero .btn.line,.hero a.btn').forEach(function(e){if(/Book a free call/.test(e.textContent))items.push([null,'Hero button now books a call (PR #11)',0,e]);});
}
var st=document.createElement('style');
st.textContent='.pv-hl{outline:3px solid #e11d1d!important;outline-offset:4px;position:relative}.pv-tag{position:absolute;z-index:99999;top:-14px;left:6px;background:#e11d1d;color:#fff;font:700 11px/1.3 system-ui,sans-serif;padding:3px 8px;border-radius:4px;max-width:90%;pointer-events:none;letter-spacing:.02em}body.pv-off .pv-hl{outline:none!important}body.pv-off .pv-tag{display:none}#pv-bar{position:fixed;z-index:2147483647;bottom:12px;left:12px;right:12px;max-width:520px;background:#e11d1d;color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:10px 14px;border-radius:10px;display:flex;gap:12px;align-items:center;justify-content:space-between;box-shadow:0 6px 24px rgba(0,0,0,.3)}#pv-bar button{background:#fff;color:#e11d1d;border:0;border-radius:99px;padding:6px 12px;font-weight:700;cursor:pointer}';
document.head.appendChild(st);
function mark(el,label){if(!el||el.classList.contains('pv-hl'))return;el.classList.add('pv-hl');var cs=getComputedStyle(el);if(cs.position==='static')el.style.position='relative';var t=document.createElement('span');t.className='pv-tag';t.textContent='UPDATED: '+label;el.appendChild(t);}
function run(){items.forEach(function(it){if(!it[1])return;var els=it[3]?[it[3]]:document.querySelectorAll(it[0]);els.forEach?els.forEach(function(e){mark(e,it[1])}):0;});}
run();
var bar=document.createElement('div');bar.id='pv-bar';bar.innerHTML='<span>PREVIEW: red boxes = changes in PRs #8-#11 (not live)</span><button type="button">Hide red</button>';
bar.querySelector('button').onclick=function(){var off=document.body.classList.toggle('pv-off');this.textContent=off?'Show red':'Hide red';};
document.body.appendChild(bar);
})();
