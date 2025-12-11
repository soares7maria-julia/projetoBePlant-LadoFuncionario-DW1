const API_BASE = 'http://localhost:3001/relatorio';

// Botões
document.getElementById('btn-print').addEventListener('click', () => window.print());
document.getElementById('btn-back').addEventListener('click', () => window.history.back());

// Tradução meses
const mesesPT = {
  January: 'Janeiro', February: 'Fevereiro', March: 'Março',
  April: 'Abril', May: 'Maio', June: 'Junho',
  July: 'Julho', August: 'Agosto', September: 'Setembro',
  October: 'Outubro', November: 'Novembro', December: 'Dezembro'
};

async function carregarRelatorioVenda() {
  try {
    // Busca todas as vendas por mês
    const res = await fetch(`${API_BASE}/vendas-por-mes`);
    const vendas = await res.json();

    const tbody = document.getElementById('tabela-vendas');

    if (!Array.isArray(vendas) || vendas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2">Nenhuma venda registrada</td></tr>`;
      return;
    }
// Descobre o mês com mais vendas
console.log("📌 VENDAS RAW:", vendas);

const melhorMes = vendas.reduce((a, b) =>
  Number(a.total) > Number(b.total) ? a : b
);

console.log("📌 MELHOR MÊS:", melhorMes);

    // Atualiza tabela
    tbody.innerHTML = `
      <tr>
        <td>${mesesPT[melhorMes.mes] ?? melhorMes.mes}</td>
        <td style="text-align:center">${melhorMes.total}</td>
      </tr>
    `;

    // ----- GRÁFICO -----
    const ctx = document.getElementById("graficoVendas").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(54,193,123,0.9)");
    gradient.addColorStop(1, "rgba(31,138,81,0.35)");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: vendas.map(v => mesesPT[v.mes] ?? v.mes),
        datasets: [{
          label: "Total de Vendas",
          data: vendas.map(v => v.total),
          backgroundColor: gradient,
          borderColor: "#1f8a51",
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Vendas por mês",
            color: "#dfffe8",
            font: { size: 18, weight: "bold" }
          }
        },
        scales: {
          x: {
            ticks: { color: "#c7f3df" },
            grid: { color: "rgba(255,255,255,0.04)" }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#c7f3df" },
            grid: { color: "rgba(255,255,255,0.04)" }
          }
        }
      }
    });

  } catch (err) {
    console.error("Erro:", err);
    document.getElementById('tabela-vendas').innerHTML =
      `<tr><td colspan="2">Erro ao carregar os dados</td></tr>`;
  }
}

carregarRelatorioVenda();
