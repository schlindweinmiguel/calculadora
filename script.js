const prevOp = document.getElementById('prevOp');
const currOp = document.getElementById('currOp');
const keys = document.getElementById('keys');

const state = {
  current: '0',
  previous: '',
  operation: null,
  justComputed: false
};

function formatNumber(nStr){
  // Mantém vírgula como separador decimal visual? Vamos exibir com ponto para cálculo e mostrar com vírgula.
  const [intPart, decPart] = nStr.split('.');
  const intFmt = Number(intPart.replace(/\D/g, '') || 0).toLocaleString('pt-BR');
  return decPart != null ? `${intFmt},${decPart}` : intFmt;
}

function display(){
  // Exibe previous (ex: "12 +") e current formatado
  prevOp.textContent = state.previous ? `${state.previous.replace('.', ',')} ${state.operation || ''}` : '';
  // Para o current usamos formatNumber mas preservando decimais digitados
  let c = state.current;
  if (c === '-') { currOp.textContent = '-'; return; }
  if (c.includes('e')) { currOp.textContent = c.replace('.', ','); return; } // números muito grandes
  const parts = c.split('.');
  const intFmt = Number((parts[0] || '0')).toLocaleString('pt-BR');
  currOp.textContent = parts[1] != null ? `${intFmt},${parts[1]}` : intFmt;
}

function clearAll(){
  state.current = '0';
  state.previous = '';
  state.operation = null;
  state.justComputed = false;
  display();
}

function delChar(){
  if (state.justComputed){ // após igual, DEL limpa
    clearAll();
    return;
  }
  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith('-'))){
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
  display();
}

function appendDigit(d){
  if (d === '.'){
    if (state.current.includes('.')) return;
    state.current += '.';
    state.justComputed = false;
    display();
    return;
  }
  if (state.justComputed){
    state.current = d;
    state.justComputed = false;
    display();
    return;
  }
  if (state.current === '0'){
    state.current = d;
  } else if (state.current === '-0'){
    state.current = '-' + d;
  } else {
    state.current += d;
  }
  display();
}

function chooseOp(op){
  if (state.operation && !state.justComputed){
    compute(); // encadeia
  }
  state.previous = state.current;
  state.current = '0';
  state.operation = op;
  state.justComputed = false;
  display();
}

function safeNumber(s){
  // Trata fim com ponto ou apenas "-"
  if (s === '-' || s === '-0' || s === '.') return 0;
  return Number(s);
}

function compute(){
  if (!state.operation || state.previous === '') return;
  const a = safeNumber(state.previous);
  const b = safeNumber(state.current);

  let res;
  switch (state.operation){
    case '+': res = a + b; break;
    case '−': res = a - b; break;
    case '×': res = a * b; break;
    case '÷': res = b === 0 ? NaN : a / b; break;
    default: return;
  }

  // Limita precisão para evitar 0.30000000004
  res = Number.isFinite(res) ? Number(res.toPrecision(12)) : res;

  state.current = String(res);
  state.previous = '';
  state.operation = null;
  state.justComputed = true;
  display();
}

function toggleSign(){
  if (state.current.startsWith('-')){
    state.current = state.current.slice(1);
  } else {
    state.current = state.current === '0' ? '-0' : '-' + state.current;
  }
  display();
}

function percent(){
  // comportamento comum: aplica % no número atual (divide por 100);
  // se houver operação e previous, usa previous * (current/100) para +,−; e current/100 para ×,÷ (comum em várias calculadoras)
  if (state.operation && state.previous !== ''){
    const a = safeNumber(state.previous);
    const b = safeNumber(state.current);
    let p;
    if (state.operation === '+' || state.operation === '−'){
      p = (a * b) / 100;
    } else {
      p = b / 100;
    }
    state.current = String(Number(p.toPrecision(12)));
  } else {
    const v = safeNumber(state.current) / 100;
    state.current = String(Number(v.toPrecision(12)));
  }
  display();
}

keys.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if (!btn) return;

  const num = btn.getAttribute('data-num');
  const op = btn.getAttribute('data-op');
  const action = btn.getAttribute('data-action');

  if (num != null){
    appendDigit(num);
  } else if (op){
    chooseOp(op);
  } else if (action){
    if (action === 'equals') compute();
    else if (action === 'clear') clearAll();
    else if (action === 'delete') delChar();
    else if (action === 'sign') toggleSign();
    else if (action === 'percent') percent();
  }
});

// Suporte ao teclado
window.addEventListener('keydown', (e)
