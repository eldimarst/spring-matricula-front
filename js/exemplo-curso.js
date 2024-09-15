//faz a exclusão de registros
async function excluirRegistro(codigo) {
    try {
        let response = await fetch(`http://localhost:8080/api/cursos/${codigo}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 204) {
            exibirAlerta('Registro não encontrado');
        } else if (!response.ok) {
            throw new Error('Erro ao excluir o registro');
        } else {
            let result = response.headers.get('Content-Length') > 0 ? await response.json() : null;
            exibirSucesso('Registro excluído com sucesso:', result);
        }
    } catch (error) {
        exibirAlerta('Houve um problema ao excluir o registro: ' + error);
    }finally{
        $('#confirmDelModal').modal('hide'); // Fecha o modal de confirmação
        $('#resultsTable').empty();
    }
}

// Funcao para abrir modal de alteração
function openModalAlterar(codigo) {
    fetch('http://localhost:8080/api/cursos/obter?codCurso=' + codigo, {
        method: 'GET'
    }).then(response => {
        if (!response.ok) {
            return response.text().then(text => { // response.text(): mensagem de erro como texto
                throw new Error(text); 
            });
        }
        return response.json();
    }).then(data => {
        $('#formCadastro')[0].reset();

        $("#modalCodCurso").val(data.codCurso);
        $("#modalNome").val(data.nome);

        // Exiba a janela modal
        $("#insertUpdateModal").modal("show");

    }).catch(error => {
        exibirAlerta(error.message);
    });
}

$(document).ready(function() {

    /////////////////////////////////////Ao carregar a modal de confirmação da exclusão manda alguns dados para tela
    $('#confirmDelModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Botão que acionou a modal
        var itemCodi = button.data('codigo'); // Extrai o valor do atributo data-codigo
        var itemNome = button.data('nome'); // Extrai o valor do atributo data-codigo
        var modal = $(this);
        modal.find('#itemNome').html('<strong>' + itemNome + '</strong>'); // Atualiza o conteúdo da modal com 
        modal.find('#confirmDelButton').data('codigoDel', itemCodi); // Define o valor de itemCodi no botão de confirmação
    });

    /////////////////////////////////////Ao clicar no botão de confirmação da exclusão dentro da Modal
    $('#confirmDelButton').on('click', function () {
        var codigo = $(this).data('codigoDel'); // Obtém o valor de itemCodi
        excluirRegistro(codigo); // Chama a função com o valor de itemCodi
    });

    /////////////////////////////////////Ao fazer submissao do formulario de alteração
    $('#formCadastro').submit(function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        var submitButton = event.target.querySelector('button[type="submit"]');
        var spinner = submitButton.querySelector('.spinner-border');

        // Mostra o spinner e desabilita o botão
        spinner.style.display = 'inline-block';
        submitButton.disabled = true;

        // Captura os dados do formulário
        const formData = {
            codCurso: document.getElementById('modalCodCurso').value,
            nome: document.getElementById('modalNome').value,
        };

        // Envia os dados para o backend
        fetch('http://localhost:8080/api/cursos/salvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { // response.text(): mensagem de erro como texto
                    throw new Error(text); 
                });
            }
            
            return response.json(); // Continua com a resposta JSON se a requisição foi bem-sucedida
        })
        .then(data => {
            $('#insertUpdateModal').modal('hide');  // Fecha modal
            $('#resultsTable').empty();             //Limpa tabela de pesquisa
            exibirSucesso(`Operação realizada com sucesso`); //Exibe mensagem de sucesso
        })
        .catch((error) => {
            exibirAlertaModal(error);
        })
        .finally(() => {
            spinner.style.display = 'none';
            submitButton.disabled = false;
        });
    });


    /////////////////////////////////////Ao clicar no botão de pesquisar alunos
    $('#searchBtn').click(function() {
        const nome = $('#nome').val();

        $("#resultsTable").html("<tr><td colspan='5'>Aguarde...</td></tr>");

        fetch('http://localhost:8080/api/cursos?nome=' + nome , {
                method: 'GET'
        })
        .then(response => {
            if (response.status === 204) {    // HTTP 204 No Content
                $('#resultsTable').empty();
                exibirAlerta('Nenhum dado encontrado.');
                return;
            }
            if (!response.ok) {
                return response.text().then(text => { // response.text(): mensagem de erro como texto
                    throw new Error(text); 
                });
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                $('#resultsTable').empty();
                
                data.forEach(function(curso, index) {
                    const uniqueId = `updateBtn${index + 1}`;

                    $('#resultsTable').append(`
                        <tr class="highlight">
                            <td>${curso.codCurso}</td>
                            <td>${curso.nome}</td>
                            <td>
                                <button type="button" class="btn btn-warning btn-sm" id="${uniqueId}">Alterar</button>
                                <button class="btn btn-danger btn-sm" data-toggle="modal" data-target="#confirmDelModal" data-nome="${curso.nome}" data-codigo="${curso.codCurso}">Excluir</button>
                            </td>
                        </tr>
                    `);

                    $(`#${uniqueId}`).click(function() {
                        openModalAlterar(curso.codCurso);
                    });
                });
                exibirSucesso(`${data.length} registros encontrados`);
            }
        })
        .catch(error => {
            $('#resultsTable').empty();
            exibirAlerta(error.message);
        });
    });

    /////////////////////////////////////Ao clicar no botão de incluir novo aluno
    $('#addBtn').click(function() {
        $("#formCadastro")[0].reset(); //limpa formulário
        $("#insertUpdateModal").modal("show");
    });

    /////////////////////////////////////Ao clicar no botão limpar pesquisa
    $('#clearBtn').click(function() {
        $('#searchForm')[0].reset(); //limpa formulário
        $('#resultsTable').empty();
    });


});