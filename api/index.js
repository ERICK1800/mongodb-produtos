import express from "express"

import cors from 'cors'
const app = express()
const port = 4000

import rotasProdutos from './routes/produtos.js'
import rotasUsuarios from './routes/usuario.js'

app.use(cors({
    origin: ['http://127.0.0.1:5500','http://localhost:4000'] //informe outras URL´s se necessário
  }));
app.use(express.json())

app.use('/', express.static('public'))

app.use('/favicon.ico', express.static('public/imagens/loja.gif'))

app.use('/api/produtos', rotasProdutos)
app.use('/api/usuarios', rotasUsuarios)

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API Fatec 100% funcional🖐',
        version: '1.0.0'
    })
})

app.use(function(req, res){
    res.status(404).json({
        errors: [{
            value: `${req.originalUrl}`,
            msg: `A rota ${req.originalUrl} não existe nesta API`,
            param: `invalid rout`
        }]
    })
})
app.listen(port, function(){
    console.log(`💻 Servidor rodando na porta ${port}`)
})
