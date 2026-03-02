const container = document.getElementById('campos-lista');
const btnAdd = document.getElementById('add-campo');

// Função para duplicar o card de cadastro
btnAdd.addEventListener('click', () => {
    const originalCard = document.querySelector('.cadastro-card');
    const novoCard = originalCard.cloneNode(true);
    
    // Limpa os valores dos inputs no novo card
    novoCard.querySelectorAll('input, textarea').forEach(input => input.value = '');
    
    // Adiciona botão de remover ao novo card (opcional)
    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.innerText = 'Remover Este Registro';
    btnRemover.className = 'btn-remove';
    btnRemover.onclick = () => novoCard.remove();
    novoCard.appendChild(btnRemover);

    container.appendChild(novoCard);
});

// Evento Principal ao Submeter o Formulário
document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cards = document.querySelectorAll('.cadastro-card');
    const dados = Array.from(cards).map(card => ({
        nome: card.querySelector('.input-nome').value,
        data: card.querySelector('.input-data').value,
        valor: card.querySelector('.input-valor').value,
        nf: card.querySelector('.input-nf').value,
        cci: card.querySelector('.input-CCI').value,
        cce: card.querySelector('.input-CCE').value,
        description: card.querySelector('.input-description').value
    }));

    // 1. Gerar o PDF primeiro (Garante que o utilizador recebe o ficheiro)
    gerarPDF(dados);

    // 2. Tentar enviar para o Servidor (Back-end)
    try {
        const res = await fetch('http://localhost:3000/api/cadastros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            alert("Sucesso! PDF gerado e dados guardados no banco.");
            // location.reload(); // Opcional: limpa a tela após sucesso
        }
    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("PDF Gerado! (Aviso: Não foi possível ligar ao servidor para salvar os dados).");
    }
});

// No topo do seu arquivo script.js, declare as variáveis das imagens
const LOGO_PORTO = "image/logo-porto.jpg";
const LOGO_PADRAO = "image/logo-padrao.png";

function gerarPDF(dados) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    dados.forEach((item, i) => {
        if (i > 0 && i % 2 === 0) doc.addPage();
        const y = (i % 2 === 0) ? 10 : 150;

        // Configuração Dinâmica
        let nomeEmpresa = "ZAMBRANO ENGENHARIA LTDA.";

        // --- DESENHO DO PDF ---
        doc.setDrawColor(0);
        doc.rect(10, y, 180, 130); // Borda

        // CABEÇALHO COM IMAGEM
        doc.rect(10, y, 180, 25);
        if (item.cci === "51" || item.cci === "57") {
            doc.addImage(LOGO_PORTO, 'JPEG', 35, y + 3, 20, 20);
            nomeEmpresa = "PORTO OBRAS LTDA.";
        } else {
            doc.addImage(LOGO_PADRAO, 'PNG', 35, y + 3, 20, 20);
            nomeEmpresa = "ZAMBRANO ENGENHARIA LTDA.";
        }
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text(nomeEmpresa, 95, y + 9);
        doc.setFontSize(12);
        doc.text("AUTORIZAÇÃO PARA EMISSÃO DE CHEQUE", 91, y + 14);

        // BORDA DADOS
        // Borda Vencimento
        doc.rect(10, y + 25, 90, 10);
        doc.rect(100, y + 25, 90, 10);
        // Borda NF
        doc.rect(10, y + 35, 90, 10);
        doc.rect(100, y + 35, 90, 10);
        // Borda Fornecedor
        doc.rect(10, y + 45, 180, 10);
        // Borda financeiro
        doc.rect(10, y + 45, 180, 30);
        doc.rect(100, y + 70, 90, 10);
        doc.rect(100, y + 60, 90, 5);
        doc.rect(100, y + 55, 90, 5);
        doc.rect(100, y + 65, 90, 5);   
        doc.rect(100, y + 80, 90, 5);
        doc.rect(10, y + 85, 180, 0);
        doc.rect(140, y + 75, 0, 10);
        //Flags de pagamento
        doc.rect(95, y + 55, 5, 5); 
        doc.rect(135, y + 55, 5, 5); 
        doc.rect(177, y + 55, 5, 5); 
        //Linha da assinatura
        doc.rect(15, y + 125, 40, 0);
    

        // INFORMAÇÕES PRÉ FIXADAS
        doc.setFont("helvetica");
        doc.setFontSize(10);
        doc.text("VENCIMENTO:", 11, y + 28);
        doc.text("VALOR:", 101, y + 28);
        doc.text("DOCUMENTO Nº:", 101, y + 38);
        doc.text("NOME DO FAVORECIDO:", 11, y + 48);
        doc.text("PAGAMENTO EM:", 11, y  + 58);
        doc.text("CAIXA", 82, y + 59);
        doc.text("DEPÓSITO", 102, y + 59);
        doc.text("COBRANÇA", 152, y + 59);
        doc.text("BANCO:", 102, y + 64);
        doc.text("AGÊNCIA:", 102, y + 69);
        doc.text("CONTA CORRENTE:", 102, y + 74);
        doc.text("CENTRO DE CUSTO:", 11, y + 79);
        doc.text("OBSERVAÇÕES:", 11, y + 91);
        doc.setFontSize(8);
        doc.text("DESTINA-SE PARA O PAGAMENTO DE:", 11, y + 38);
        doc.text("ASSINATURA DO EMITENTE", 16, y + 129);
        doc.setFont("helvetica", "bold");
        doc.text("Nota Fiscal", 55, y + 43);
        doc.text("PARCEIRO", 111, y + 79);
        doc.text("ZAMBRANO", 155, y + 79);

        //Variavel para nome:
        
        //VARIAVEIS
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(item.data.split('-').reverse().join('/'), 50, y + 33);
        doc.text("R$ " + parseFloat(item.valor).toFixed(2), 130, y + 33);
        doc.text(item.nf.toUpperCase(), 140 - (item.nf.length / 2), y + 43);
        doc.text(item.nome.toUpperCase(), 80 - (item.nome.length / 2), y + 53, {maxWidth: 145});
        doc.text(item.cci, 161, y + 84);
        doc.text(item.cce, 116, y + 84);
        doc.text(item.description.toUpperCase(), 80 - (item.description.length / 2), y + 100, {maxWidth: 145});
    });

    doc.save("autorizacao.pdf");
}