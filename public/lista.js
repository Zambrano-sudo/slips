// Função que busca os dados no Back-end
async function carregarDados() {
  const corpoTabela = document.getElementById('corpo-tabela');

  // Limpa a tabela antes de carregar (para não duplicar)
  corpoTabela.innerHTML = '<tr><td colspan="8">Carregando dados...</td></tr>';

  try {
      const resposta = await fetch('http://localhost:3000/api/cadastros');
      const dados = await resposta.json();

      corpoTabela.innerHTML = ''; // Limpa o "Carregando"

      if (dados.length === 0) {
          corpoTabela.innerHTML = '<tr><td colspan="8">Nenhum registro encontrado.</td></tr>';
          return;
      }

      // Preenche a tabela com os dados do banco
      dados.forEach(item => {
          const linha = document.createElement('tr');

          // Formatando a data para o padrão brasileiro
          const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');

          linha.innerHTML = `
              <td>${item.nome}</td>
              <td>${item.nf}</td>
              <td>${dataFormatada}</td>
              <td>R$ ${parseFloat(item.valor).toFixed(2)}</td>
              <td>${item.description}</td>
              <td>${item.cci}</td>
              <td>${item.cce}</td>
              <td>${new Date().toLocaleDateString('pt-BR')}</td>
          `;
          corpoTabela.appendChild(linha);
      });

  } catch (error) {
      console.error("Erro ao buscar dados:", error);
      corpoTabela.innerHTML = '<tr><td colspan="8" style="color:red">Erro ao conectar com o servidor.</td></tr>';
  }
}

// Carrega os dados assim que a página abre
window.onload = carregarDados;
