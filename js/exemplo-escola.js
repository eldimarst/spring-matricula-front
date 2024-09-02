// Exibe o alerta erro
function exibirAlerta(mensagem) {
    $('#alerta').text(mensagem).css({
        'background-color': '#f8d7da',
        'color': '#721c24',
        'border': '1px solid #f8d7da'
    }).fadeIn();
    setTimeout(function() {
        $('#alerta').fadeOut();
    }, 4000); // Desaparece após 4 segundos (4000 ms)
}

// Exibe o alerta sucesso
function exibirSucesso(mensagem) {
    $('#alerta').text(mensagem).css({
        'background-color': '#d4edda',
        'color': '#155724',
        'border': '1px solid #c3e6cb'
    }).fadeIn();
    setTimeout(function() {
        $('#alerta').fadeOut();
    }, 3000); // Desaparece após 3 segundos (3000 ms)
}

//faz a exclusão de registros
async function excluirRegistro(codigo) {
    try {
        let response = await fetch(`http://localhost:8080/api/alunos/${codigo}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 204) {
            exibirAlerta('Registro não encontrado');
        } else if (!response.ok) {
            throw new Error('Erro ao excluir o registro');
        } else {
            let result = response.headers.get('Content-Length') > 0 ? await response.json() : null;
            console.log('Registro excluído com sucesso:', result);
            exibirSucesso('Registro excluído com sucesso:', result);
        }
    } catch (error) {
        console.error('Erro:', error);
        exibirAlerta('Houve um problema ao excluir o registro: ' + error);
    }finally{
        $('#confirmDelModal').modal('hide'); // Fecha o modal de confirmação
        $('#resultsTable').empty();
    }
}


$(document).ready(function() {
    $('#confirmDelModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Botão que acionou a modal
        var itemCodi = button.data('codigo'); // Extrai o valor do atributo data-codigo
        var itemNome = button.data('nome'); // Extrai o valor do atributo data-codigo
        var modal = $(this);
        modal.find('#itemNome').html('<strong>' + itemNome + '</strong>'); // Atualiza o conteúdo da modal com 
        modal.find('#confirmDelButton').data('codigoDel', itemCodi); // Define o valor de itemCodi no botão de confirmação
    });

    $('#confirmDelButton').on('click', function () {
        var codigo = $(this).data('codigoDel'); // Obtém o valor de itemCodi
        excluirRegistro(codigo); // Chama a função com o valor de itemCodi
    });

    $('#searchBtn').click(function() {
        const nome = $('#nome').val();
        const cpf = $('#cpf').val();

        $("#resultsTable").html("<tr><td colspan='5'>Aguarde...</td></tr>");

        fetch('http://localhost:8080/api/alunos?nome=' + nome + '&cpf=' + cpf, {
                method: 'GET'
        })
        .then(response => {
            if (response.status === 204) {    // HTTP 204 No Content
                $('#resultsTable').empty();
                exibirAlerta('Nenhum dado encontrado.');
                return;
            }
            if (!response.ok) {
                throw new Error('Erro: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                $('#resultsTable').empty();
                
                data.forEach(aluno => {
                    let dataNasc = new Date(aluno.dataNasc).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    $('#resultsTable').append(`
                        <tr class="highlight">
                            <td>${aluno.codAluno}</td>
                            <td>${aluno.cpf}</td>
                            <td>${aluno.nome}</td>
                            <td>${dataNasc}</td>
                            <td>
                                <button class="btn btn-warning btn-sm">Alterar</button>
                                <button class="btn btn-danger btn-sm" data-toggle="modal" data-target="#confirmDelModal" data-nome="${aluno.nome}" data-codigo="${aluno.codAluno}">Excluir</button>
                            </td>
                        </tr>
                    `);
                });
                exibirSucesso(`${data.length} registros encontrados`);
            }
        })
        .catch(error => {
            $('#resultsTable').empty();
            exibirAlerta(error.message);
        });
    });

    $('#addBtn').click(function() {
        // Lógica para incluir um novo aluno
    });

    $('#clearBtn').click(function() {
        $('#searchForm')[0].reset();
        $('#resultsTable').empty();
    });
});