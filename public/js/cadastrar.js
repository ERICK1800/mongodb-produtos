const urlBase = 'https://mongodb-produtos.vercel.app/api'
//const urlBase = 'http://localhost:4000/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))

document.getElementById('cadastroForm').addEventListener('submit', function (event) {
    event.preventDefault()
    let usuario = {
        "nome": document.getElementById('nome').value,
        "email": document.getElementById('email').value,
        "senha": document.getElementById('senha').value
    }
    salvaUsuario(usuario)
})

async function salvaUsuario(usuario) {    
    await fetch(`${urlBase}/usuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .then(data => {      
        if (data.acknowledged) {
            alert('✔ Usuario incluído com sucesso!')
            document.getElementById('cadastroForm').reset()
            resultadoModal.hide();
        } else if (data.errors) {
            const errorMessages = data.errors.map(error => error.msg).join("\n");
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${errorMessages}</span>`
            resultadoModal.show();
        } else {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>${JSON.stringify(data)}</span>`
            resultadoModal.show();
        }
    })
    .catch(error => {
        document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuario: ${error.message}</span>`
        resultadoModal.show();
    });
}
