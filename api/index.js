import express from "express"

const app = express()
const port = 4000

import rotasProdutos from './routes/produtos.js'

app.use(express.json())

app.use('/', express.static('public'))

app.use('/favicon.ico', express.static('public/imagens/pc.png'))

app.use('/api/produtos', rotasProdutos)
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
