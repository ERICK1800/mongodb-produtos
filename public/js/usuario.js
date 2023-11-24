const urlBase = 'https://mongodb-produtos.vercel.app/api'
//const urlBase = 'http://localhost:4000/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null

document.getElementById('formUsuario').addEventListener('submit', function (event) {
    event.preventDefault()
    const idUsuario = document.getElementById('id').value
    let usuario = {}

    if (idUsuario.length > 0) {
        usuario = {
            "_id": idUsuario,
            "nome": document.getElementById('nome').value,
            "email": document.getElementById('email').value,
            "senha": document.getElementById('senha').value,
            "ativo": document.getElementById('ativo').checked,
            "tipo": document.getElementById('tipo').value,
            "avatar": document.getElementById('avatar').value
        }
    } else {
        usuario = {
            "nome": document.getElementById('nome').value,
            "email": document.getElementById('email').value,
            "senha": document.getElementById('senha').value,
            "ativo": document.getElementById('ativo').checked,
            "tipo": document.getElementById('tipo').value,
            "avatar": document.getElementById('avatar').value
        }
    }
    salvaUsuario(usuario)
})

async function salvaUsuario(usuario) {    
    if (usuario.hasOwnProperty('_id')) {
        await fetch(`${urlBase}/usuarios`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            },
            body: JSON.stringify(usuario)
        })
            .then(response => response.json())
            .then(data => {       
                if (data.acknowledged) {
                    alert('✔ Usuario alterado com sucesso!')
                    document.getElementById('formUsuario').reset()
                    carregaUsuarios()
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

    } else {
        await fetch(`${urlBase}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            },
            body: JSON.stringify(usuario)
        })
            .then(response => response.json())
            .then(data => {      
                if (data.acknowledged) {
                    alert('✔ Usuario incluído com sucesso!')
                    document.getElementById('formUsuario').reset()
                    carregaUsuarios()
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
}

async function carregaUsuarios() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = ''
    await fetch(`${urlBase}/usuarios`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(usuario => {
                tabela.innerHTML += `
                <tr>
                   <td>${usuario.nome}</td>
                   <td>${usuario.email}</td>
                   <td>${usuario.ativo}</td>                   
                   <td>${usuario.tipo}</td> 
                   <td>${usuario.avatar}</td>
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removeUsuario("${usuario._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaUsuarioPeloId("${usuario._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuario: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removeUsuario(id) {
    if (confirm('Deseja realmente excluir o usuario?')) {
        await fetch(`${urlBase}/usuarios/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    carregaUsuarios()
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuario: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaUsuarioPeloId(id) {
    await fetch(`${urlBase}/usuarios/id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data[0]) {
                document.getElementById('id').value = data[0]._id
                document.getElementById('nome').value = data[0].nome
                document.getElementById('email').value = data[0].email
                document.getElementById('senha').value = data[0].senha
                document.getElementById('ativo').value = data[0].ativo
                document.getElementById('tipo').value = data[0].tipo
                document.getElementById('avatar').value = data[0].avatar
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o usuario: ${error.message}</span>`
            resultadoModal.show();
        });
}
