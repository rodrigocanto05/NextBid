/**
 * Inicia um cronometro decrescente num elemento HTML.
 * @param {string} dataFim - Data/hora de fim no formato ISO (ex: "2026-05-01 20:00:00")
 * @param {HTMLElement} elemento - Elemento onde o tempo é exibido
 */
function iniciarCronometro(dataFim, elemento) {
    function atualizar() {
        const agora = new Date().getTime();
        const fim = new Date(dataFim).getTime();
        const diff = fim - agora;

        if (diff <= 0) {
            elemento.textContent = 'Leilão encerrado';
            return;
        }

        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);

        if (dias > 0) {
            elemento.textContent = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
        } else {
            elemento.textContent = `${horas}h ${minutos}m ${segundos}s`;
        }

        setTimeout(atualizar, 1000);
    }

    atualizar();
}
