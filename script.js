(function () {

  const APP_VERSION = '1.2';

  'use strict';

  // URL DA API EM PRODUÇÃO
  const API_URL = 'https://ipv4subnetcalculator-api-production.up.railway.app';

// ======================================================
// BUSCA ELEMENTOS DO HTML PELO ID
// ======================================================

  const $ = (id) => document.getElementById(id);

  let current = null;

// ======================================================
// EXIBE MENSAGENS DE ERRO PARA O USUÁRIO
// ======================================================

  function showError(msg) {
    const el = $('error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearError() {
    $('error').classList.add('hidden');
    $('error').textContent = '';
  }

// ======================================================
// PREENCHE OS CARDS DE RESULTADO COM OS DADOS
// RETORNADOS PELA API
// ======================================================

  function render(data, ipDigitado, cidrDigitado) {
    current = {
      ...data,
      ipDigitado,
      cidrDigitado
    };

    $('empty').classList.add('hidden');
    $('result').classList.remove('hidden');

    $('r-ip').textContent = ipDigitado;
    $('r-cidr').textContent = cidrDigitado;
    $('r-cidr2').textContent = '/' + cidrDigitado;

    $('r-network').textContent = data.rede;
    $('r-broadcast').textContent = data.broadcast;
    $('r-hosts').textContent = data.quantidadeHost.toLocaleString('pt-BR');
    $('r-first').textContent = data.primeiroHost;
    $('r-last').textContent = data.ultimoHost;
    $('r-class').textContent = data.tipoRede;
    $('r-class2').textContent = data.tipoRede;
    $('r-mask').textContent = data.mascara;
    $('r-wildcard').textContent = data.wildCard;
    $('r-binary').textContent = data.binarioRede;
    $('r-cidr2').textContent = '/' + cidrDigitado;

      // ROLA ATÉ A ÁREA DE RESULTADOS
    $('result').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  }

// ======================================================
// ENVIA A REQUISIÇÃO PARA A API SPRING BOOT
// RECEBE O JSON E ATUALIZA A INTERFACE
// ======================================================

async function calc() {
  clearError();
  clearInputErrors();

  const btn = $('calcBtn');
  const btnText = $('calcBtnText');

  const ip = $('ip').value.trim();
  const cidr = $('cidr').value.trim();

  // VALIDA CAMPOS VAZIOS
  if (!ip || !cidr) {
    current = null;

    $('result').classList.add('hidden');
    $('empty').classList.remove('hidden');

    if (!ip) markInputError('ip');
    if (!cidr) markInputError('cidr');

    showError('Informe o IP e o CIDR!');
    return;
  }

  try {
    btn.disabled = true;
    btnText.textContent = 'Calculando...';

    const entrada = `${ip}/${cidr}`;

    const response = await fetch(
      `${API_URL}/api/subnet?ip=${encodeURIComponent(entrada)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.erro || data.message || data.error || 'Erro ao calcular sub-rede'
      );
    }

    render(data, ip, cidr);
    saveHistory(ip, cidr);

  } catch (e) {
    current = null;

    $('result').classList.add('hidden');
    $('empty').classList.remove('hidden');

    showError(e.message);

  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btnText.textContent = 'Calcular Sub-rede';
    }, 700);
  }
}

// ======================================================
// COPIA TODOS OS RESULTADOS PARA A ÁREA DE TRANSFERÊNCIA
// ======================================================

  async function copyAll() {
    if (!current) return;

    const text = [
      `IP/CIDR: ${current.ipDigitado}/${current.cidrDigitado}`,
      `Rede: ${current.rede}`,
      `Broadcast: ${current.broadcast}`,
      `Primeiro Host: ${current.primeiroHost}`,
      `Último Host: ${current.ultimoHost}`,
      `Hosts: ${current.quantidadeHost}`,
      `Máscara de Rede: ${current.mascara}`,
      `Máscara Wildcard: ${current.wildCard}`,
      `Tipo da Rede: ${current.tipoRede}`,
      `Binário da Rede: ${current.binarioRede}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {}

    const label = $('copyLabel');
    label.textContent = 'Copiado!';
    setTimeout(() => {
      label.textContent = 'Copiar';
    }, 1500);


  }

// ======================================================
// LIMPA OS CAMPOS E VOLTA A INTERFACE PARA O ESTADO INICIAL
// ======================================================

function reset() {
  current = null;
  clearError();
  clearInputErrors();

  // VOLTA PARA O TOPO DA PÁGINA PRIMEIRO
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // DEPOIS LIMPA A INTERFACE
  setTimeout(() => {
    $('result').classList.add('hidden');
    $('empty').classList.remove('hidden');

    $('sobre').classList.remove('hidden-mobile');

    $('ip').value = '';
    $('cidr').value = '';
  }, 350);
}


// ======================================================
// EXPORTA OS RESULTADOS PARA CSV
// ======================================================

  function exportCsv() {
    if (!current) return;

    const rows = [
      ['Campo', 'Valor'],
      ['IP', current.ipDigitado],
      ['CIDR', current.cidrDigitado],
      ['Rede', current.rede],
      ['Broadcast', current.broadcast],
      ['Primeiro Host', current.primeiroHost],
      ['Último Host', current.ultimoHost],
      ['Hosts', String(current.quantidadeHost)],
      ['Máscara de Rede', current.mascara],
      ['Máscara Wildcard', current.wildCard],
      ['Tipo da Rede', current.tipoRede],
      ['Binário da Rede', current.binarioRede]
    ];

    const csv = rows
        .map((row) => row.map((v) => `"${v}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `subrede-${current.ipDigitado}-${current.cidrDigitado}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

// ======================================================
// HISTÓRICO DE CONSULTAS
// ======================================================

function openHistoryModal() {
  $('historyModal').classList.remove('hidden');
  renderHistory();
}

function closeHistoryModal() {
  $('historyModal').classList.add('hidden');
}

function saveHistory(ip, cidr) {

  const consulta = `${ip}/${cidr}`;

  let historico =
      JSON.parse(localStorage.getItem('historicoIPv4')) || [];

  // Evita duplicidade consecutiva
  if (historico[0] !== consulta) {
    historico.unshift(consulta);
  }

  // Mantém somente os últimos 10 registros
  historico = historico.slice(0, 10);

  localStorage.setItem(
      'historicoIPv4',
      JSON.stringify(historico)
  );
}

function renderHistory() {

  const lista = $('historyList');

  const historico =
      JSON.parse(localStorage.getItem('historicoIPv4')) || [];

  lista.innerHTML = '';

  if (historico.length === 0) {

    const li = document.createElement('li');
    li.textContent = 'Nenhuma consulta realizada.';
    li.classList.add('history-empty');

    lista.appendChild(li);

    return;
  }

  historico.forEach(item => {

    const li = document.createElement('li');

    li.textContent = item;

    li.addEventListener('click', () => {

      const [ip, cidr] = item.split('/');

      $('ip').value = ip;
      $('cidr').value = cidr;

      closeHistoryModal();

      calc();
    });

    lista.appendChild(li);
  });
}

function clearHistory() {

  localStorage.removeItem('historicoIPv4');

  renderHistory();
}

function markInputError(...ids) {
  ids.forEach(id => {
    $(id).classList.add('input-error');
  });
}

function clearInputErrors() {
  $('ip').classList.remove('input-error');
  $('cidr').classList.remove('input-error');
}


// ======================================================
// REGISTRA TODOS OS EVENTOS DA PÁGINA APÓS O CARREGAMENTO
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  $('year').textContent = new Date().getFullYear();
  $('version').textContent = APP_VERSION;

  $('calcBtn').addEventListener('click', calc);
  $('resetBtn').addEventListener('click', reset);
  $('copyBtn').addEventListener('click', copyAll);
  $('csvBtn').addEventListener('click', exportCsv);

  // HISTÓRICO
  $('historyBtn').addEventListener('click', openHistoryModal);
  $('closeHistoryBtn').addEventListener('click', closeHistoryModal);
  $('clearHistoryBtn').addEventListener('click', clearHistory);

  $('historyModal').addEventListener('click', (e) => {
    if (e.target.id === 'historyModal') {
      closeHistoryModal();
    }
  });

  // BLOQUEIA LETRAS E LIMITA O CAMPO IP A 15 CARACTERES
  $('ip').addEventListener('input', () => {
    clearInputErrors();

    let value = $('ip').value.replace(/[^0-9.]/g, '');
    $('ip').value = value.slice(0, 15);
  });

  // BLOQUEIA LETRAS, LIMITA A 2 CARACTERES E IMPEDE CIDR MAIOR QUE 32
  $('cidr').addEventListener('input', () => {
    clearInputErrors();

    let value = $('cidr').value.replace(/[^0-9]/g, '');

    value = value.slice(0, 2);

    if (value !== '' && parseInt(value) > 32) {
      value = '32';
    }

    $('cidr').value = value;
  });

  ['ip', 'cidr'].forEach((id) => {
    $(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        calc();
      }
    });
  });

  renderHistory();
});
})();