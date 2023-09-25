import express from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import { check, ExpressValidator, validationResult } from "express-validator"

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'informatica'

/*
* GET /api/produtos
* Lista todos os produtos do serviço
*/
router.get('/', async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({produto: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    }catch(err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a lista dos produtos',
                param: '/'
            }]
        })
    } 
})

export default router
