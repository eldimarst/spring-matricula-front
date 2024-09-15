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
