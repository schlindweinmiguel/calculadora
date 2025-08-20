// Aqui está TODO o JavaScript que estava na tag <script>
(function(){
  const el = s => document.querySelector(s);
  const output = el('#output');
  const historyEl = el('#history');
  const tapeItems = el('#tapeItems');
  const clickSnd = el('#clickSnd');

  let current = '0';
  let expr = '';
  let justEvaluated = false;
  let mem = 0;

  const fmt = n => {
    if (!isFinite(n)) return 'Erro';
    const str = Number(n).toPrecision(12);
    const cleaned = (+str).toString();
    return cleaned.length > 18 ? Number(n).toExponential(8) : cleaned;
  };

  let soundOn = false;
  el('#soundBtn').addEventListener('click', () => {
    soundOn = !soundOn;
    el('#soundBtn').textContent = soundOn ? '🔊' : '🔈';
    play();
  });

  const root = document.documentElement;
  let light = false;
  el('#themeBtn').addEventListener('click', () => {
    light = !light; document.body.classList.toggle('light', light);
    el('#themeBtn').textContent = light ? '☀️' : '🌙';
    play();
  });

  function play(){
    if (soundOn) { try { clickSnd.currentTime = 0; clickSnd.play(); } catch(e){} }
  }

  function setDisplay(val){
    current = val;
    output.textContent = val.replace('.', ',');
  }

  function appendDigit(d){
    if (justEvaluated){ expr=''; justEvaluated=false; }
    if (current === '0' && d !== ',') current = '';
    if (d === ','){
      if (current.includes('.')) return;
      if (current === '') current = '0';
      current += '.';
    } else {
      current += d;
    }
    setDisplay(current);
  }

  function applyOp(op){
    if (current !== ''){ expr += current; current = ''; }
    expr = expr.replace(/[+\\-*/]$/, '');
    expr += op;
    historyEl.textContent = expr.replaceAll('*','×').replaceAll('/', '÷');
    justEvaluated = false;
    play();
  }

  function backspace(){
    if (justEvaluated) return;
    if (current){
      if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))){ setDisplay('0'); current=''; }
      else setDisplay(current.slice(0, -1));
    }
    play();
  }

  function clearAll(){ current='0'; expr=''; setDisplay('0'); historyEl.textContent=''; justEvaluated=false; play(); }
  function clearEntry(){ current='0'; setDisplay('0'); play(); }

  function sign(){
    if (!current || current==='0') return;
    if (current.startsWith('-')) setDisplay(current.slice(1));
    else setDisplay('-'+current);
    play();
  }

  function sqrt(){
    const n = parseFloat(current || '0');
    if (n < 0) { setDisplay('Erro'); current=''; return; }
    setDisplay(fmt(Math.sqrt(n)).toString());
    justEvaluated=false; play();
  }

  function recip(){
    const n = parseFloat(current || '0');
    if (n === 0){ setDisplay('Erro'); current=''; return; }
    setDisplay(fmt(1/n).toString());
    play();
  }

  function percent(){
    const base = evalSafe(expr.replace(/[+\\-*/]$/, '')) || 0;
    const n = parseFloat(current || '0');
    const p = base * (n/100);
    setDisplay(fmt(p).toString());
    play();
  }

  function evalSafe(fullExpr){
    if (!fullExpr) return 0;
    try{ return Function('return ('+fullExpr+')')(); }
    catch(e){ return NaN; }
  }

  function equals(){
    if (current !== ''){ expr += current; current=''; }
    expr = expr.replace(/[+\\-*/]$/, '');
    const val = evalSafe(expr);
    const res = fmt(val);
    setDisplay(String(res));
    addTape(expr, res);
    historyEl.textContent = '';
    expr = '';
    justEvaluated = true;
    play();
  }

  function addTape(e, r){
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<span>${e.replaceAll('*','×').replaceAll('/', '÷')}</span><strong>${r}</strong>`;
    row.addEventListener('click', ()=>{ setDisplay(String(r)); justEvaluated=false; });
    tapeItems.prepend(row);
  }

  document.querySelectorAll('button.key').forEach(b=>{
    b.addEventListener('click', ()=>{
      const v = b.getAttribute('data-val');
      const act = b.getAttribute('data-act');
      if (v !== null){ appendDigit(v); return; }
      switch(act){
        case 'equals': return equals();
        case 'backspace': return backspace();
        case 'clear-all': return clearAll();
        case 'clear-entry': return clearEntry();
        case 'sqrt': return sqrt();
        case 'percent': return percent();
        case 'recip': return recip();
        case 'sign': return sign();
      }
    })
  });

  window.addEventListener('keydown', (e)=>{
    const k = e.key;
    if (/^\\d$/.test(k)) return appendDigit(k);
    if (k === '.' || k === ',') return appendDigit(',');
    if (['+','-','*','/'].includes(k)) return applyOp(k);
    if (k === 'Enter' || k === '=') return equals();
    if (k === 'Backspace') return backspace();
    if (k === 'Escape') return clearAll();
    if (k === 'Delete') return clearEntry();
    if (k.toLowerCase() === 'r') return sqrt();
    if (k.toLowerCase() === 'i') return recip();
    if (k === '%') return percent();
    if (k.toLowerCase() === 'f') return sign();
    if (k.toLowerCase() === 't') el('#themeBtn').click();
    if (k.toLowerCase() === 's') el('#soundBtn').click();
  });

  setDisplay('0');
})();

