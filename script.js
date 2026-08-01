/* 
   Controle de Empréstimo de Livros - Biblioteca
   Aluno: Marco Antonio Ferreira da Silva
   ========================================================== */

// ---------- elementos da tela ----------
const wrapper = document.querySelector(".wrapper");
const backBtn = document.querySelector(".back_btn");
const colecoes = document.querySelectorAll(".colecao");

const colecaoTitulo = document.getElementById("colecao-titulo");
const colecaoContador = document.getElementById("colecao-contador");
const listaEmprestimos = document.getElementById("lista-emprestimos");
const resumoEmprestimos = document.getElementById("resumo-emprestimos");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitulo = document.getElementById("modal-titulo");
const formEmprestimo = document.getElementById("form-emprestimo");
const inputLivro = document.getElementById("input-livro");
const inputLeitor = document.getElementById("input-leitor");
const inputPrazo = document.getElementById("input-prazo");
const btnAbrirModalNovo = document.getElementById("btn-abrir-modal-novo");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");

// ---------- Estado da aplicação ----------


let colecaoAtual = null;   // categoria (coleção) que está sendo exibida
let idEmEdicao = null;     // guarda o id do empréstimo em edição (null = modo "novo")

let emprestimos = [
    { id: gerarId(), categoria: "Literatura", livro: "Dom Casmurro", leitor: "Ana Beatriz", prazo: proximaData(3), devolvido: false },
    { id: gerarId(), categoria: "Acadêmico", livro: "Introdução aos Algoritmos", leitor: "Carlos Eduardo", prazo: proximaData(-1), devolvido: false },
    { id: gerarId(), categoria: "Infantojuvenil", livro: "O Menino Maluquinho", leitor: "Sofia Lima", prazo: proximaData(7), devolvido: true },
];

// ---------- Funções auxiliares ----------

// Gera um identificador único simples para cada empréstimo
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Retorna uma data (YYYY-MM-DD) a partir de hoje + N dias (aceita negativo para simular atraso)
function proximaData(diasAPartirDeHoje) {
    const data = new Date();
    data.setDate(data.getDate() + diasAPartirDeHoje);
    return data.toISOString().split("T")[0];
}

// Converte a forma "YYYY-MM-DD" em "DD/MM/AAAA" para exibir
function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Verifica se um empréstimo está atrasado 
function estaAtrasado(item) {
    if (item.devolvido) return false;
    const hoje = new Date().toISOString().split("T")[0];
    return item.prazo < hoje;
}

// ---------- Renderização ----------

// Atualiza o resumo da tela inicial (total de empréstimos ativos junto do contador por coleção)
function renderizarHome() {
    const ativos = emprestimos.filter((item) => !item.devolvido).length;
    resumoEmprestimos.textContent =
        ativos === 1
            ? "Você tem 1 empréstimo ativo."
            : `Você tem ${ativos} empréstimos ativos.`;

    document.querySelectorAll("[data-contador-de]").forEach((span) => {
        const categoria = span.dataset.contadorDe;
        const total = emprestimos.filter(
            (item) => item.categoria === categoria && !item.devolvido
        ).length;
        span.textContent = total;
    });
}

// Renderiza a lista de empréstimos da coleção atualmente aberta
function renderizarEmprestimosDaColecao() {
    const itensDaColecao = emprestimos.filter(
        (item) => item.categoria === colecaoAtual
    );

    colecaoTitulo.textContent = colecaoAtual;
    colecaoContador.textContent = itensDaColecao.filter((i) => !i.devolvido).length;

    listaEmprestimos.innerHTML = "";

    if (itensDaColecao.length === 0) {
        listaEmprestimos.innerHTML =
            '<p class="sem-emprestimos">Nenhum empréstimo cadastrado nesta coleção ainda.</p>';
        return;
    }

    itensDaColecao.forEach((item) => {
        const atrasado = estaAtrasado(item);

        const label = document.createElement("label");
        label.className = "emprestimo-item" + (atrasado ? " atrasado" : "");
        label.dataset.id = item.id;

        label.innerHTML = `
            <input type="checkbox" ${item.devolvido ? "checked" : ""}>
            <span class="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </span>

            <div class="emprestimo-info">
                <p class="emprestimo-livro">${item.livro}</p>
                <p class="emprestimo-leitor">
                    ${item.leitor} · ${atrasado ? "atrasado desde" : "devolução até"} ${formatarData(item.prazo)}
                </p>
            </div>

            <div class="edit" title="Editar empréstimo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
            </div>

            <div class="delete" title="Excluir empréstimo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </div>
        `;

        listaEmprestimos.appendChild(label);
    });
}

// -------- Ações sobre os empréstimos (Crud) -------

function alternarDevolvido(id) {
    emprestimos = emprestimos.map((item) =>
        item.id === id ? { ...item, devolvido: !item.devolvido } : item
    );
    renderizarEmprestimosDaColecao();
    renderizarHome();
}

function excluirEmprestimo(id) {
    emprestimos = emprestimos.filter((item) => item.id !== id);
    renderizarEmprestimosDaColecao();
    renderizarHome();
}

function adicionarEmprestimo(dados) {
    emprestimos.push({
        id: gerarId(),
        categoria: colecaoAtual,
        livro: dados.livro,
        leitor: dados.leitor,
        prazo: dados.prazo,
        devolvido: false,
    });
    renderizarEmprestimosDaColecao();
    renderizarHome();
}

function editarEmprestimo(id, dados) {
    emprestimos = emprestimos.map((item) =>
        item.id === id
            ? { ...item, livro: dados.livro, leitor: dados.leitor, prazo: dados.prazo }
            : item
    );
    renderizarEmprestimosDaColecao();
    renderizarHome();
}

// ---------- novo empréstimo  ----------

function abrirModalNovoEmprestimo() {
    idEmEdicao = null;
    modalTitulo.textContent = "Novo empréstimo";
    formEmprestimo.reset();
    inputPrazo.value = proximaData(7); // coloquei uma sugestão padrão: 7 dias de prazo
    modalBackdrop.classList.add("aberto");
    inputLivro.focus();
}

function abrirModalEdicaoEmprestimo(item) {
    idEmEdicao = item.id;
    modalTitulo.textContent = "Editar empréstimo";
    inputLivro.value = item.livro;
    inputLeitor.value = item.leitor;
    inputPrazo.value = item.prazo;
    modalBackdrop.classList.add("aberto");
    inputLivro.focus();
}

function fecharModal() {
    modalBackdrop.classList.remove("aberto");
    idEmEdicao = null;
}

// ---------- Navegação entre as telas --------

function abrirColecao(categoria) {
    colecaoAtual = categoria;
    renderizarEmprestimosDaColecao();
    wrapper.classList.add("show-categoria");
}

function voltarParaHome() {
    wrapper.classList.remove("show-categoria");
}

// ----------OS Eventos ----------

colecoes.forEach((colecao) => {
    colecao.addEventListener("click", () => {
        abrirColecao(colecao.dataset.categoria);
    });
});

backBtn.addEventListener("click", voltarParaHome);

btnAbrirModalNovo.addEventListener("click", abrirModalNovoEmprestimo);
btnCancelarModal.addEventListener("click", fecharModal);

modalBackdrop.addEventListener("click", (evento) => {
    if (evento.target === modalBackdrop) fecharModal();
});

formEmprestimo.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const dados = {
        livro: inputLivro.value.trim(),
        leitor: inputLeitor.value.trim(),
        prazo: inputPrazo.value,
    };

    if (!dados.livro || !dados.leitor || !dados.prazo) return;

    if (idEmEdicao) {
        editarEmprestimo(idEmEdicao, dados);
    } else {
        adicionarEmprestimo(dados);
    }

    fecharModal();
});

// Delegação de eventos na lista: clique no checkbox, no editar ou no excluir
listaEmprestimos.addEventListener("click", (evento) => {
    const itemEl = evento.target.closest(".emprestimo-item");
    if (!itemEl) return;

    const id = itemEl.dataset.id;

    if (evento.target.closest(".delete")) {
        evento.preventDefault();
        excluirEmprestimo(id);
        return;
    }

    if (evento.target.closest(".edit")) {
        evento.preventDefault();
        const item = emprestimos.find((i) => i.id === id);
        if (item) abrirModalEdicaoEmprestimo(item);
        return;
    }

    if (evento.target.matches('input[type="checkbox"]')) {
        alternarDevolvido(id);
    }
});

// ---------- Inicialização ----------
renderizarHome();
