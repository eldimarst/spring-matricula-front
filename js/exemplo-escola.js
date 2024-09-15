// Exibe o alerta erro
function exibirAlerta(mensagem) {
    $('#alerta').text(mensagem).css({
        'background-color': '#f8d7da',
        'color': '#721c24',
        'border': '1px solid #f8d7da'
    }).fadeIn();

    // Oculta a mensagem após 4 segundos (4000 milissegundos)
    setTimeout(function() {
        $('#alerta').fadeOut();
    }, 4000);
}

// Exibe o alerta sucesso
function exibirSucesso(mensagem) {
    $('#alerta').text(mensagem).css({
        'background-color': '#d4edda',
        'color': '#155724',
        'border': '1px solid #c3e6cb'
    }).fadeIn();

    // Oculta a mensagem após 3 segundos (3000 milissegundos)
    setTimeout(function() {
        $('#alerta').fadeOut();
    }, 3000); // Desaparece após 3 segundos (3000 ms)
}

function exibirAlertaModal(error){
    $('#errorModalMessage').text(error);
    $('#errorModalMessage').css('display', 'block');
    
    // Oculta a mensagem após 3 segundos (3000 milissegundos)
    setTimeout(function() {
        $('#errorModalMessage').text('');
        $('#errorModalMessage').css('display', 'none');
    }, 3000);
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

// Funcao para abrir modal de alteração
function openModalAlterar(codAluno) {
    fetch('http://localhost:8080/api/alunos/obter?codAluno=' + codAluno, {
        method: 'GET'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Erro: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $("#modalCodAluno").val(data.codAluno);
        $("#modalNome").val(data.nome);
        $("#modalCpf").val(data.cpf);
        $("#modalDataNasc").val(data.dataNasc);
        $("#modalCep").val(data.cep);
        $("#modalLogradouro").val(data.logradouro);
        $("#modalNumero").val(data.numero);
        $("#modalBairro").val(data.bairro);
        $("#modalCidade").val(data.cidade);
        $("#modalUf").val(data.uf);

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
            codAluno: document.getElementById('modalCodAluno').value,
            nome: document.getElementById('modalNome').value,
            cpf: document.getElementById('modalCpf').value,
            dataNasc: document.getElementById('modalDataNasc').value,
            cep: document.getElementById('modalCep').value,
            logradouro: document.getElementById('modalLogradouro').value,
            numero: document.getElementById('modalNumero').value,
            bairro: document.getElementById('modalBairro').value,
            cidade: document.getElementById('modalCidade').value,
            uf: document.getElementById('modalUf').value
        };

        // Envia os dados para o backend
        fetch('http://localhost:8080/api/alunos/salvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { // Use response.text() para obter a mensagem de erro como texto
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
                
                data.forEach(function(aluno, index) {
                    let dataNasc = new Date(aluno.dataNasc).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    const uniqueId = `updateBtn${index + 1}`;

                    $('#resultsTable').append(`
                        <tr class="highlight">
                            <td>${aluno.codAluno}</td>
                            <td>${aluno.cpf}</td>
                            <td>${aluno.nome}</td>
                            <td>${dataNasc}</td>
                            <td>
                                <button type="button" class="btn btn-warning btn-sm" id="${uniqueId}">Alterar</button>
                                <button class="btn btn-danger btn-sm" data-toggle="modal" data-target="#confirmDelModal" data-nome="${aluno.nome}" data-codigo="${aluno.codAluno}">Excluir</button>
                            </td>
                        </tr>
                    `);

                    $(`#${uniqueId}`).click(function() {
                        openModalAlterar(aluno.codAluno);
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
        // Lógica para incluir um novo aluno
    });

    /////////////////////////////////////Ao clicar no botão limpar pesquisa
    $('#clearBtn').click(function() {
        $('#searchForm')[0].reset();
        $('#resultsTable').empty();
    });

    /////////////////////////////////////Busca CEP quando for preenchido no formulário da modal
    $("#modalCep").blur(function() {
        var cep = $(this).val().replace(/\D/g, '');
        if (cep != "") {
            var validacep = /^[0-9]{8}$/;
            if(validacep.test(cep)) {
                $("#modalLogradouro").val("...");
                $("#modalBairro").val("...");
                $("#modalCidade").val("...");
                $("#modalUf").val("...");

                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(dados => {
                    if (!dados.erro) {
                        $("#modalLogradouro").val(dados.logradouro);
                        $("#modalBairro").val(dados.bairro);
                        $("#modalCidade").val(dados.localidade);
                        $("#modalUf").val(dados.uf);
                    } else {
                        exibirAlertaModal("CEP não encontrado.");
                    }
                })
                .catch(error => {
                    exibirAlertaModal("Erro ao buscar o CEP:", erro);
                });

            } else {
                exibirAlertaModal("Formato de CEP inválido.");
            }
        }
    });

});