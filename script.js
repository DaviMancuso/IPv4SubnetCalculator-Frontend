(function () {

  const APP_VERSION = 'v1.1.0';

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
    $('r-cidr2').textContent = + cidrDigitado;

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

  const btn = $('calcBtn');
  const btnText = $('calcBtnText');

  try {

    const ip = $('ip').value.trim();
    const cidr = $('cidr').value.trim();

    // VALIDA CAMPOS VAZIOS  (PREVENÇÃO DE UM POSSIVEL ERRO PARA DIMINUIR CHAMADA DO BACK-END)
    if (!ip || !cidr) {
      showError('Informe o IP e o CIDR!');
      return;
    }
   

    // BLOQUEIA O BOTÃO DURANTE A REQUISIÇÃO
    // EVITA CLIQUES REPETIDOS DO USUÁRIO
    btn.disabled = true;
    btnText.textContent = 'Calculando...';

    const entrada = `${ip}/${cidr}`;

    // ENVIA A REQUISIÇÃO PARA A API
    const response = await fetch(
  `${API_URL}/api/subnet?ip=${encodeURIComponent(entrada)}`
);
    const data = await response.json();

    // TRATA ERROS RETORNADOS PELA API
    if (!response.ok) {
      throw new Error(
        data.erro || data.message || data.error || 'Erro ao calcular sub-rede'
      );
    }

    // ATUALIZA OS RESULTADOS NA INTERFACE
    render(data, ip, cidr);

  } catch (e) {

    // EXIBE A MENSAGEM DE ERRO AO USUÁRIO
    current = null;
    $('result').classList.add('hidden');
    $('empty').classList.remove('hidden');
    showError(e.message);

  } finally {

    // REATIVA O BOTÃO APÓS A CONCLUSÃO DA REQUISIÇÃO
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

  $('result').classList.add('hidden');
  $('empty').classList.remove('hidden');

  $('ip').value = '';
  $('cidr').value = '';

  // VOLTA PARA O TOPO DA PÁGINA
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
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
// REGISTRA TODOS OS EVENTOS DA PÁGINA APÓS O CARREGAMENTO
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  $('year').textContent = new Date().getFullYear();
  $('version').textContent = APP_VERSION;

  $('calcBtn').addEventListener('click', calc);
  $('resetBtn').addEventListener('click', reset);
  $('copyBtn').addEventListener('click', copyAll);
  $('csvBtn').addEventListener('click', exportCsv);

  // BLOQUEIA LETRAS E LIMITA O CAMPO IP A 15 CARACTERES
  $('ip').addEventListener('input', () => {
    let value = $('ip').value.replace(/[^0-9.]/g, '');
    $('ip').value = value.slice(0, 15);
  });

  // BLOQUEIA LETRAS, LIMITA A 2 CARACTERES E IMPEDE CIDR MAIOR QUE 32
  $('cidr').addEventListener('input', () => {
    let value = $('cidr').value.replace(/[^0-9]/g, '');

    // Limita para 2 caracteres
    value = value.slice(0, 2);

    // Impede valores maiores que 32
    if (value !== '' && parseInt(value) > 32) {
      value = '32';
    }

    $('cidr').value = value;
  });

  ['ip', 'cidr'].forEach((id) => {
    $(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calc();
    });
  });
});
})();