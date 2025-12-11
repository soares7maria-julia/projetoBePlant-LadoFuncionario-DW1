const API_BASE = 'http://localhost:3001/relatorio';

document.getElementById('btn-print').addEventListener('click', () => window.print());
document.getElementById('btn-back').addEventListener('click', () => window.history.back());

const mesesPT = {
  January: 'Janeiro', February: 'Fevereiro', March: 'Março',
  April: 'Abril', May: 'Maio', June: 'Junho',
  July: 'Julho', August: 'Agosto', September: 'Setembro',
  October: 'Outubro', November: 'Novembro', December: 'Dezembro'
};

async function carregarRelatorioClientes() {
  try {
    const res = await fetch(`${API_BASE}/clientes-por-mes`);
    if (!res.ok) throw new Error("Erro ao buscar dados");

    const data = await res.json();

    // ============================
    //       TABELA HORIZONTAL
    // ============================

    const linhaMeses = document.getElementById("linha-meses");
    const linhaValores = document.getElementById("linha-valores");

    linhaMeses.innerHTML = `<th>MÊS</th>`;
    linhaValores.innerHTML = `<td>CLIENTES</td>`;

    data.forEach(item => {
      const mesPT = mesesPT[item.mes] ?? item.mes;

      linhaMeses.innerHTML += `<th>${mesPT}</th>`;
      linhaValores.innerHTML += `<td class="cell-center">${item.total}</td>`;
    });

    // ============================
    //          GRÁFICO
    // ============================

    const ctx = document.getElementById("graficoClientes").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(54,193,123,0.9)");
    gradient.addColorStop(1, "rgba(31,138,81,0.35)");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(d => mesesPT[d.mes] ?? d.mes),
        datasets: [{
          label: "Clientes cadastrados",
          data: data.map(d => d.total),
          backgroundColor: gradient,
          borderColor: "#1f8a51",
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Clientes cadastrados por mês",
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
    console.error(err);
    document.getElementById("linha-meses").innerHTML =
      `<th>Erro ao carregar dados</th>`;
    document.getElementById("linha-valores").innerHTML =
      `<td>—</td>`;
  }
}

carregarRelatorioClientes();
