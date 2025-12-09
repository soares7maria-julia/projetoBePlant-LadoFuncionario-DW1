// =======================================
// GRÁFICO: VENDAS POR MÊS
// =======================================
fetch("http://localhost:3001/relatorio/vendas-por-mes")
    .then(response => response.json())
    .then(data => {

        const meses = data.map(item => item.mes);
        const totalVendas = data.map(item => item.total_vendas);

        const ctxVendas = document.getElementById("graficoVendas");

        new Chart(ctxVendas, {
            type: "line",
            data: {
                labels: meses,
                datasets: [{
                    label: "Quantidade de vendas",
                    data: totalVendas,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true
            }
        });
    })
    .catch(err => console.error("Erro ao carregar relatório de vendas:", err));
