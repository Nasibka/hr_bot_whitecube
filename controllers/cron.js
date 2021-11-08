var CronJob = require('cron').CronJob;
const { sendMessage,inlineKeyboard } = require("../helpers/bot");
const kboard = require("../constants/keyboard");

const CANDIDATE = require("../models/candidate");


//крон для напоминанинй о первом созвоне
new CronJob('*/15 * * * *',async function() {
    console.log('You will see this message every 15 minute(cron for sozvon1)');

    let candidates = await CANDIDATE.find({ntf_1_sent:false}); 

    candidates.forEach(candidate=>{
        const sozvon_1 = new Date(candidate.sozvon_1)
        const currentTime = new Date()
        console.log(candidate)
        console.log(currentTime)
        //за час до собеседования(но не прям за час, от 45 до 60 минут, так как крон на каждые 15 минут)
        if((sozvon_1-3600000)<=currentTime.getTime()+21600000){
            //чтобы случайно не отправил сообщение за максимум 10 минут, если человек только что выбрал время 
            if((sozvon_1-300000)>=currentTime.getTime()){
                //форматируем время взятое из даты под формат: 00:03, 12:08, 09:12, чтобы красиво отправить в кнопках
                let time
                if(sozvon_1.getHours()<10 && sozvon_1.getMinutes()<10){
                    time = '0'+sozvon_1.getHours()+":0"+sozvon_1.getMinutes() 
                }else if(sozvon_1.getHours()<10){
                    time = '0'+sozvon_1.getHours()+":"+sozvon_1.getMinutes() 
                }else if(sozvon_1.getMinutes()<10){
                    time = sozvon_1.getHours()+":0"+sozvon_1.getMinutes() 
                }else {
                    time = sozvon_1.getHours()+":"+sozvon_1.getMinutes() 
                }
                sendMessage(candidate.chat_id,'Куку. Cозвон сегодня в '+time+', помнишь? Всё в силе?',inlineKeyboard(kboard.sozvon1),true)
                console.log(time,'cron.js 17')
                candidate.ntf_1_sent = true
                candidate.save();

            }
        }
    })

}, null, true).start();

new CronJob('*/60 * * * *',async function() {
    console.log('You will see this message every hour(cron for tests_reminder_sent)');

    let candidates = await CANDIDATE.find({tests_reminder_sent:false}); 

    candidates.forEach(candidate=>{
        const tests_reminder = new Date(candidate.tests_reminder)
        const currentTime = new Date()
        //через 20 часов после отправки тестов напомнить о них 
        if((tests_reminder+72000000)<=currentTime.getTime()+21600000){
            sendMessage(candidate.chat_id,'Ты прошел тесты?',inlineKeyboard(kboard.sozvon1),true)
            console.log(tests_reminder.getHours()+":"+tests_reminder.getMinutes(),'cron.js 42')
            user.tests_reminder_sent = true
            user.save();
        }
    })
    
    
}, null, true).start();







async function kek(){
    let candidates = await CANDIDATE.find({ntf_1_sent:false}); 

    candidates.forEach(candidate=>{
        console.log(candidate)
        console.log(candidate.chat_id)
        const currentTime = new Date().getTime()
        
        const sozvon_1 = 1605506923000// 12:08
        console.log(sozvon_1-3600000)
            if((sozvon_1-3600000)<currentTime){
                let kek =new Date(sozvon_1)
                sendMessage(candidate.chat_id,'Куку. Cозвон сегодня в '+kek.getHours()+":"+kek.getMinutes()+', помнишь? Всё в силе?',inlineKeyboard(kboard.sozvon1),true)
                console.log(kek.getHours() +":"+kek.getMinutes())
            }
    })

}
// kek()