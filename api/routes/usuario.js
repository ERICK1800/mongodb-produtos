/* API REST dos usuários */
import express, { json } from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import { check, ExpressValidator, validationResult } from "express-validator"

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'usuarios'

import auth from "../middleware/auth.js"
import bcrypt from 'bcryptjs'
import jwt  from 'jsonwebtoken'

const validaUsuari = [
    check('nome')
        .not().isEmpty().trim().withMessage('É obrigatório unformar o nome')
        .isAlpha('pt-BR', {ignore:' '}).withMessage('Informe apenas texto no nome')
        .isLength({min: 3}).withMessage('O nome do usuário deve ter ao menos 3 caracteres')
        .isLength({max: 100}).withMessage('O nome do usuário deter no máximo 100 caracteres'),
    check('email')
        .not().isEmpty().trim().withMessage('É obrigatório unformar o email')
        .isLowercase().withMessage('O email não pode ter MAIÚSCULOS')
        .isEmail().withMessage('O email deve ser válido')
        .custom((value, {req}) => {
            return db.collection(nomeCollection).find({email: {$eq: value}}).toArray()
            .then((email) => {
                if (email.length && !req.params.id){
                    return Promise.reject(`O email ${value} já existe!`)
                }
            })
        }),
    check('senha')
        .not().isEmpty().trim().withMessage('É obrigatório informar a senha')
        .isLength({min: 6}).withMessage('A senha do usuário deve ter ao menos 6 caracteres')
        .isStrongPassword({minLength: 6, minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1}).withMessage('A senha informada não é segura. Informe no mínimo 1 caractere maiúsculo, 1 caractere minúsculo, 1 número e 1 caractere especial'),
    check('ativo')
        .default(true).isBoolean().withMessage('O valor deve ser um booleano. True ou False'),
    check('tipo')
        .default('Cliente').isIn(['Admin','Cliente']).withMessage('O tipo de usuário deve ser Cliente ou Admin'),
    check('avatar')
        .optional({nullable: true})
        .isURL().withMessage('O endereço do avatar deve ser uma URL válida')
]

// Post de usuários
router.post('/', validaUsuari, async(req, res) => {
    const schemaErrors = validationResult(req)
    if(!schemaErrors.isEmpty()){
        return res.status(400).json(({
            errors: schemaErrors.array()
        }))
    }else{
        req.body.avatar = `https://ui-avatars.com/api/?name=${req.body.nome.replace(/ /g, '+')}&&background=random`
        const salt = await bcrypt.genSalt(10)
        req.body.senha = await bcrypt.hash(req.body.senha, salt)
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(201).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/* Post /usuarios/Login 
Efetua o login de usuários e retorna o token JWT
*/
const validaLogin = [
    check('email')
        .not().isEmpty().trim().withMessage('É obrigatório unformar o email')
        .isEmail().withMessage('O email deve ser válido'),
    check('senha')
        .not().isEmpty().trim().withMessage('É obrigatório informar a senha')
        .isLength({min: 6}).withMessage('A senha do usuário deve ter ao menos 6 caracteres')
]

router.post('/login', validaLogin, async(req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({errors: schemaErrors.array()}))
    }
    const {email, senha} = req.body
    try{
        let usuario = await db.collection(nomeCollection).find({email}).limit(1).toArray()
        if (!usuario.length) {
            return res.status(404).json({
                errors: [{
                    value: `${email}`,
                    msg: 'O email informado não está cadastrado',
                    param: 'email'
                }]
            })
        }
        const isMatch = await bcrypt.compare(senha, usuario[0].senha)
        if (!isMatch) {
            return res.status(403).json({
                errors: [{
                    value: `${senha}`,
                    msg: 'A senha informado está incorreta',
                    param: 'senha'
                }]
            })
        }
        jwt.sign(
            {usuario: {id: usuario[0]._id}},
            process.env.SECRET_KEY,
            {expiresIn: process.env.EXPIRES_IN},
            (err, token) => {
                if (err) {
                    throw err
                }
                res.status(200).json({
                    access_token: token
                })
            }
        )
    }catch(e){
        console.error(e)
    }
})

/* Get /usuarios
Lista todos os usuários. Necessita de token
*/
router.get('/', auth, async(req, res) => {
    try{
        db.collection(nomeCollection)
        .find({}, {projection: {senha: false}})
        .sort({nome: 1})
        .toArray((err, docs) => {
            if (!err) {
                res.status(200).json(docs)
            }
        })
    }catch (err){
        res.status(500).json({errors:
            [{msg: 'Erro ao obter a lista de usuários'}]
        })
    }
})

/*
* Get /api/usuarios/id/:id
* Lista todos os usuarios da loja
*/
router.get('/id/:id', auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}}).toArray((err, docs) => {
            if(err){
                res.status(400).json(err)
            }else{
                res.status(200).json(docs)
            }
        })
    }catch(err){
        res.status(500).json({"error": err.message})
    }
})

/* Delete /usuarios
Removo o usuário pelo id. Necessita de token
*/
router.delete('/:id', auth, async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({'_id': {$eq: ObjectId(req.params.id)}})
    .then(result => res.status(202).send(result)) // accepted
    .catch(err => res.status(400).json(err))
})

/* Put /usuarios
Altera os dados de um usuário pelo id. Necessita de token
*/
router.put('/:id', auth, validaUsuari, async(req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json({
            errors: schemaErrors.array()
        })
    }else{
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq: ObjectId(req.params.id)}},
        {$set: req.body})
        .then(result => res.status(202).send(result)) // accepted
        .catch(err => res.status(400).json(err))
    }
})

export default router
