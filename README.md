# Controle de Empréstimo de Livros - Biblioteca

**Aluno:** Marco Antonio Ferreira da Silva
**Tema sorteado:** Controle de empréstimo de livros (biblioteca)

## Descrição geral

Aplicativo web para controlar empréstimos de livros de uma biblioteca. Os empréstimos são organizados
em três coleções (categorias do acervo): **Literatura**, **Acadêmico** e **Infantojuvenil**. Para cada
empréstimo é possível registrar o título do livro, o nome do leitor e o prazo de devolução.

### Funcionalidades
- Adicionar um novo empréstimo (livro, leitor e prazo de devolução) dentro de uma coleção.
- Editar um empréstimo já cadastrado.
- Marcar um empréstimo como devolvido (checkbox).
- Excluir um empréstimo.
- Identificação visual de empréstimos atrasados (prazo vencido e ainda não devolvido).
- Contagem de empréstimos ativos, tanto no total (tela inicial) quanto por coleção.
- Layout responsivo (funciona em tela de computador e de celular).
- Os dados existem apenas em memória durante a sessão (ver observação abaixo).

## Estrutura dos arquivos

```
index.html   → estrutura das telas (página inicial, coleção/empréstimos, modal de cadastro)
style.css    → estilos visuais, incluindo o modal e o layout responsivo
script.js    → toda a lógica: estado da aplicação, CRUD e persistência
README.md    → este arquivo
```

## Como os dados são armazenados e renderizados

Cada empréstimo é um objeto Javascript com este formato:

```js
{
  id: "kx3f9a1b2",
  categoria: "Literatura",
  livro: "Dom Casmurro",
  leitor: "Ana Beatriz",
  prazo: "2026-08-02",
  devolvido: false
}
```

Todos os empréstimos ficam guardados em um único array, `emprestimos`, que existe em memória
enquanto a página está aberta. Toda vez que esse array é alterado (adicionar, editar, excluir ou marcar
como devolvido), a função `salvarEmprestimos()` serializa o array inteiro com `JSON.stringify()` e grava
em `localStorage`, sob a chave `"biblioteca-emprestimos"`.

Quando a página é carregada, a função `carregarEmprestimos()` faz o caminho inverso: lê a string salva
no `localStorage`, converte de volta para array com `JSON.parse()` e usa isso como estado inicial. Se
não houver nada salvo (primeiro acesso), o app usa uma lista de exemplo  (`dadosIniciais`) só para não
começar vazio, e já grava essa lista no `localStorage`.

A tela nunca é montada "na mão" no HTML: sempre que o array `emprestimos` muda, a função
`renderizarEmprestimosDaColecao()` limpa o conteúdo da lista (`listaEmprestimos.innerHTML = ""`) e
reconstrói cada item filtrando apenas os empréstimos da coleção que está aberta no momento
(`colecaoAtual`). A tela inicial (contadores por coleção e total de empréstimos ativos) é atualizada
separadamente pela função `renderizarHome()`.

## Como funcionam os principais eventos

- **Abrir uma coleção:** cada card de coleção na tela inicial tem um evento de `click` que chama
  `abrirColecao(categoria)`, guardando a categoria escolhida em `colecaoAtual` e adicionando a classe
  `show-categoria` no elemento `.wrapper`, o que desliza a tela de empréstimos para dentro da view.
- **Voltar:** o botão de voltar (`back_btn`) apenas remove a classe `show-categoria`.
- **Adicionar:** o botão "+" (`btn-abrir-modal-novo`) abre o modal em modo "novo" (`idEmEdicao = null`).
  Ao submeter o formulário, como não há `idEmEdicao`, a função `adicionarEmprestimo()` é chamada e um
  novo objeto é criado com um id gerado por `gerarId()`.
- **Editar:** o ícone de lápis em cada item chama `abrirModalEdicaoEmprestimo(item)`, que preenche o
  formulário com os dados atuais e guarda o id em `idEmEdicao`. Ao submeter, como existe `idEmEdicao`, a
  função `editarEmprestimo()` é chamada em vez de criar um novo item.
- **Concluir (marcar como devolvido):** o clique é detectado por delegação de eventos no container da
  lista (`listaEmprestimos.addEventListener("click", ...)`). Se o alvo do clique é o checkbox, a função
  `alternarDevolvido(id)` inverte o campo `devolvido` daquele item específico.
- **Excluir:** clicar no ícone de lixeira chama `excluirEmprestimo(id)`, que recria o array `emprestimos`
  filtrando fora o item com aquele id (`array.filter`).
- Todas essas ações terminam chamando `salvarEmprestimos()` (grava no `localStorage`) e as funções de
  renderização (para a tela refletir a mudança imediatamente).

## Sobre a persistência dos dados

Nesta versão, os empréstimos existem apenas em memória, na variável `emprestimos` dentro de
`script.js`. Isso significa que, ao recarregar a página, a lista volta ao estado inicial definido no
código (os três empréstimos de exemplo). Não há gravação em `localStorage` nem em nenhum outro tipo de
armazenamento, nesse caso, o app usa exclusivamente o array `emprestimos` como estado.

## Dificuldade encontrada e como foi resolvida

Uma dificuldade foi decidir como marcar visualmente um empréstimo atrasado sem guardar um campo fixo de
"status" que ficaria desatualizado com o tempo (por exemplo, um livro que hoje está no prazo mas amanhã
estará atrasado). A solução foi calcular o atraso dinamicamente, comparando a data de hoje com o campo
`prazo` toda vez que a lista é renderizada, através da função `estaAtrasado(item)`. Assim o status de
atraso está sempre correto no momento em que a tela é aberta, sem precisar de nenhuma tarefa em segundo
plano para atualizar os dados salvos.

## Demonstração

- Vídeo de demonstração: Hospedado no Youtube (link do vídeo enviado no Google Classroom).
