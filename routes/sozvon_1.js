const express = require("express");
const router = express.Router();

const CANDIDATE = require("../models/candidate");
const {sozvon_1, sozvon_1_ended, sozvon_1_passed} = require('../controllers/secondStage')

router.post("/", async (req, res) => {
    const chat_id = req.body.chat_id
    const value = req.body.value

    if(value === 'Ок'){
        let user = await CANDIDATE.findOne({ chat_id: chat_id });
        if(user){
            user.stage = 2
            user.step = 0
            user.save((err, saved) => {
                if(err) console.log(err, ' ,error in saving stage 2 in sozvon.js');
                if (saved) {
                    console.log('Stage #2 is saved')
                    sozvon_1(chat_id);
                };
            });
        }
        res.send(chat_id+' '+value);
    }else{
        res.send('Не корректные данные');
    }
    
    
});

router.post("/ended", async (req, res) => {
    const chat_id = req.body.chat_id
    const value = req.body.value

    if(value === 'Да'){
        sozvon_1_ended(chat_id);
        res.send(chat_id+' '+value);
    }else{
        res.send('Не корректные данные');
    }

    
});

router.post("/next", async (req, res) => {
    const chat_id = req.body.chat_id
    const value = req.body.value

    if(value === 'Прошел'){
        sozvon_1_passed(chat_id);
        res.send(chat_id+' '+value);
    }else{
        res.send('Не корректные данные');
    }
    
    
});

module.exports = router;