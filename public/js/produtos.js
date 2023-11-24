const urlBase = 'https://mongodb-produtos.vercel.app/api'
//const urlBase = 'http://localhost:4000/api'
const resultadoModal = new bootstrap.Modal(document.getElementById("modalMensagem"))
const access_token = localStorage.getItem("token") || null

document.getElementById('formProduto').addEventListener('submit', function (event) {
    event.preventDefault()
    const idProduto = document.getElementById('id').value
    let produto = {}

    if (idProduto.length > 0) {
        produto = {
            "_id": idProduto,
            "produto": document.getElementById('produto').value,
            "marca": document.getElementById('marca').value,
            "preco": document.getElementById('preco').value,
            "estoque": document.getElementById('estoque').value,
            "cor": document.getElementById('cor').value,
            "data_lancamento": document.getElementById('data_lancamento').value,
            "classificacao": document.getElementById('classificacao').value,
            "peso": document.getElementById('peso').value
        }
    } else {
        produto = {
            "produto": document.getElementById('produto').value,
            "marca": document.getElementById('marca').value,
            "preco": document.getElementById('preco').value,
            "estoque": document.getElementById('estoque').value,
            "cor": document.getElementById('cor').value,
            "data_lancamento": document.getElementById('data_lancamento').value,
            "classificacao": document.getElementById('classificacao').value,
            "peso": document.getElementById('peso').value
        }
    }
    salvaProduto(produto)
})

async function salvaProduto(produto) {    
    if (produto.hasOwnProperty('_id')) {
        await fetch(`${urlBase}/produtos`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            },
            body: JSON.stringify(produto)
        })
            .then(response => response.json())
            .then(data => {       
                if (data.acknowledged) {
                    alert('✔ Produto alterado com sucesso!')
                    document.getElementById('formProduto').reset()
                    carregaProdutos()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o produto: ${error.message}</span>`
                resultadoModal.show();
            });

    } else {
        await fetch(`${urlBase}/produtos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            },
            body: JSON.stringify(produto)
        })
            .then(response => response.json())
            .then(data => {      
                if (data.acknowledged) {
                    alert('✔ Produto incluído com sucesso!')
                    document.getElementById('formProduto').reset()
                    carregaProdutos()
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
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o produto: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function carregaProdutos() {
    const tabela = document.getElementById('dadosTabela')
    tabela.innerHTML = ''
    await fetch(`${urlBase}/produtos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "access-token": access_token
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(produto => {
                tabela.innerHTML += `
                <tr>
                   <td>${produto.produto}</td>
                   <td>${produto.marca}</td>
                   <td>${produto.preco}</td>
                   <td>${produto.estoque}</td>                   
                   <td>${produto.cor}</td> 
                   <td>${produto.data_lancamento}</td> 
                   <td>${produto.classificacao}</td> 
                   <td>${produto.peso}</td> 
                   <td>
                       <button class='btn btn-danger btn-sm' onclick='removeProduto("${produto._id}")'>🗑 Excluir </button>
                       <button class='btn btn-warning btn-sm' onclick='buscaProdutoPeloId("${produto._id}")'>📝 Editar </button>
                    </td>           
                </tr>
                `
            })
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o produto: ${error.message}</span>`
            resultadoModal.show();
        });
}

async function removeProduto(id) {
    if (confirm('Deseja realmente excluir o produto?')) {
        await fetch(`${urlBase}/produtos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "access-token": access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    carregaProdutos()
                }
            })
            .catch(error => {
                document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o produto: ${error.message}</span>`
                resultadoModal.show();
            });
    }
}

async function buscaProdutoPeloId(id) {
    await fetch(`${urlBase}/produtos/id/${id}`, {
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
                document.getElementById('produto').value = data[0].produto
                document.getElementById('marca').value = data[0].marca
                document.getElementById('preco').value = data[0].preco
                document.getElementById('estoque').value = data[0].estoque
                document.getElementById('cor').value = data[0].cor
                document.getElementById('data_lancamento').value = data[0].data_lancamento
                document.getElementById('classificacao').value = data[0].classificacao
                document.getElementById('peso').value = data[0].peso
            }
        })
        .catch(error => {
            document.getElementById("mensagem").innerHTML = `<span class='text-danger'>Erro ao salvar o produto: ${error.message}</span>`
            resultadoModal.show();
        });
}
