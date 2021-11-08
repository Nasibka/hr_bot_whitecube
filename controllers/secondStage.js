const { HRBot } = require("../startup/telegram");
const { sendMessage, inlineKeyboard } = require("../helpers/bot");
const {addCell,getTimetable, getTestsLinks, checkBusy, insertEvent } = require('../google_services/actions')
const texts = require("../constants/texts");
const kboard = require("../constants/keyboard");
const days = require("../constants/days");
const moment = require('moment');
moment.locale('ru') 

const CANDIDATE = require("../models/candidate");

const week_callback = ['0','1','2','3','4','5','6']
const time_regex = /^(\d{1}|\d{2}):(\d{1}|\d{2})$/;

module.exports.sozvon_1 = async function(chat_id){
    console.log('sozvon1')
    let user = await CANDIDATE.findOne({ chat_id: chat_id });
   
    // const today = moment().format('dddd')
    // const currentDayNumber =  days.find(({name})=>name===today[0].toUpperCase()+today.slice(1)).number
    const currentTime = new Date().getTime()

    if(user && user.stage === 2 && user.step === 0){
        const timetable = await getTimetable(user.vacancy,currentTime)
        let available_days = []
        for(t of timetable){
            const dayOfWeek = days.find(({number})=>number===parseInt(Object.keys(t))).name
            let dateOfMonth = t[parseInt(Object.keys(t))][0][0]
            dateOfMonth = dateOfMonth.getDate()+"."+(dateOfMonth.getMonth()+1)+"."+dateOfMonth.getFullYear()
            available_days.push([{text:dayOfWeek+'('+dateOfMonth+")",callback_data:Object.keys(t)[0]}])
        }

        user.step = 1
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) {
                console.log('step 1 stage 2 saved');
                console.log(user)
            }
        });

        sendMessage(chat_id,texts.sozvon_1,inlineKeyboard(available_days));

    }
}

// ПРИНИМАЕМ CALLBACK НАЖАТЫХ INLINE КНОПОК //

HRBot.action(week_callback,async (ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    
    if(user && user.stage === 2 && user.step === 1){
        //узнаем какой день выбрал пользователь
        const choosedDay = ctx.callbackQuery.data
        const buttons = ctx.callbackQuery.message.reply_markup.inline_keyboard
        buttons.forEach(day => {
            const found = day.find(({callback_data})=>callback_data===choosedDay)
            if(found){
                const day = found.text.replace(/\(|\)/gi," ").split(' ')[1].split('.')[0]
                const month = found.text.replace(/\(|\)/gi," ").split(' ')[1].split('.')[1]
                const year = found.text.replace(/\(|\)/gi," ").split(' ')[1].split('.')[2]

                let dateForSozvon1 = new Date()
                dateForSozvon1.setDate(day)
                dateForSozvon1.setMonth(month-1)
                dateForSozvon1.setFullYear(year)
                console.log(dateForSozvon1,64)
                //сохраняем в базу
                user.sozvon_1 = dateForSozvon1
                user.step = 2
                user.save((err, saved) => {
                    if(err) console.log(err, ' ,error in secondStage js');
                    if(saved) {
                        console.log('sozvon1 day saved');
                        console.log(user)
                    }
                });
            }
        });

        //предлагаем свободное время того дня, который выбрал кандидат
        let available_times
        const dayOfWeek = days.find(({number})=>number==choosedDay).name
        const currentTime = new Date().getTime()
        const timetable = await getTimetable(user.vacancy,currentTime)
        for(t of timetable){
            if(t[choosedDay]){
                available_times = t[choosedDay]
                break
            }
        }

        let oneDay = await Promise.all(available_times.map(async (t)=>{
                let result = []
                let isBusy = await checkBusy(t[0],t[1])
                if(!isBusy){
                    let time
                    //форматируем время взятое из даты под формат: 00:03, 12:08, 09:12, чтобы красиво отправить в кнопках
                    if(t[0].getHours()<10 && t[0].getMinutes()<10){
                        time = '0'+t[0].getHours()+":0"+t[0].getMinutes() 
                    }else if(t[0].getHours()<10){
                        time = '0'+t[0].getHours()+":"+t[0].getMinutes() 
                    }else if(t[0].getMinutes()<10){
                        time = t[0].getHours()+":0"+t[0].getMinutes() 
                    }else {
                        time = t[0].getHours()+":"+t[0].getMinutes() 
                    }
                    
                    result.push({text:time,callback_data:time})
                }                
                return result;
            }) 
        );

        sendMessage(ctx.chat.id,'Выберите время('+dayOfWeek+'):',inlineKeyboard(oneDay));

    }
})

HRBot.action(time_regex,async (ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    console.log(user)
    if(user && user.stage === 2 && user.step === 2){
        const choosedTime = ctx.callbackQuery.data
        let dateForSozvon1 = new Date(user.sozvon_1)
        dateForSozvon1.setHours(choosedTime.split(':')[0])
        dateForSozvon1.setMinutes(choosedTime.split(':')[1])
        user.sozvon_1 = dateForSozvon1
        user.step = 3
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) {
                console.log('sozvon1 time saved');
                console.log(user)
            }
        });
        //сохраняем в таблицу
        const dateString = moment(dateForSozvon1.getTime()).format('ll')+' '+moment(dateForSozvon1.getTime()).format('h:mm a')
        await addCell(ctx.chat.id,'Дата собеседования на этап 1',dateString) 
        sendMessage(ctx.chat.id,'Отлично, передам данные Елене');


        //сохраняем в календарь
        
        let dateForSozvon1_end = new Date(dateForSozvon1)
        dateForSozvon1_end.setHours(dateForSozvon1.getHours(),dateForSozvon1.getMinutes()+10,0)
        dateForSozvon1_end = new Date(dateForSozvon1_end.getTime() - 21600000)
        dateForSozvon1 = new Date(dateForSozvon1.getTime() - 21600000)
        console.log(dateForSozvon1,149)
        console.log(dateForSozvon1_end,150)
        insertEvent('Первый созвон с '+user.name+ ' '+ user.surname,'Номер телефона: '+user.phone,dateForSozvon1,dateForSozvon1_end)
        
        
    }
})

HRBot.action("sozvon1_yes",async (ctx) => {
    console.log('sozvon1_yes')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage===2 && user.step === 3){
        sendMessage(ctx.chat.id,'Круто! Ждите звонка от Елены.')
    }
})

HRBot.action("sozvon1_no",async (ctx) => {
    console.log('sozvon1_no')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage===2 && user.step === 3){
        sendMessage(ctx.chat.id,'Печально :( А когда у Вас получится? Напишите удобное время. Я попробую согласовать с Еленой :)')
    }
})


module.exports.sozvon_1_ended = async function(chat_id){
    console.log('sozvon_1_ended')
    let user = await CANDIDATE.findOne({ chat_id: chat_id });

    if(user && user.stage === 2 && user.step === 3){
        user.step = 4
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) console.log('step 4 stage 2 saved');
        });

        sendMessage(chat_id,texts.after_sozvon_1);

    }
}

module.exports.sozvon_1_passed = async function(chat_id){
    console.log('sozvon_1_next')
    let user = await CANDIDATE.findOne({ chat_id: chat_id });

    if(user && user.stage === 2 && user.step === 4){
        user.step = 5
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) console.log('step 5 stage 2 saved');
        });

        sendMessage(chat_id,texts.sozvon1_passed,inlineKeyboard(kboard.ready_to_move_on,true));
    }
}


HRBot.action("ready",async (ctx) => {
    console.log('ready to move on')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.stage===2 && user.step === 5){
        user.step = 6
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) console.log('step 5 stage 2 saved');
        });
        sendMessage(ctx.chat.id,texts.give_tests,inlineKeyboard(kboard.pass_tests))
    }
})

HRBot.action("not_ready",async (ctx) => {
    console.log('not ready to move on')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.stage===2 && user.step === 5){
        user.step = 6
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage js');
            if(saved) console.log('step 5 stage 2 saved');
        });
        sendMessage(ctx.chat.id,'Печально :( Ну ничего, что-нибудь придумаем :)')
    }
})

HRBot.action("send_tests",async (ctx) => {
    console.log('sending tests')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    const tests_links = await getTestsLinks(user.vacancy)

    if(user && user.stage===2 && user.step === 6){
        sendMessage(ctx.chat.id,'Держи: '+tests_links)
        user.tests_reminder = new Date()
        user.step = 7
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage.js');
            if (saved) console.log('tests_reminder saved');
        });
    }
})

HRBot.action("dont_send_tests",async (ctx) => {
    console.log('dont want to pass tests')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.stage===2 && user.step === 6){
        user.step = 7
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage.js');
            if (saved) console.log('tests_reminder saved');
        });
        sendMessage(ctx.chat.id,'Печально :( Ну ничего, что-нибудь придумаем :)')
    }
})

HRBot.action("check_tests",async (ctx) => {
    console.log('check_tests')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });

    if(user && user.stage===2 && user.step === 7){
        sendMessage(ctx.chat.id,'Отлично, спасибо! Дай нам еще немного времени посмотреть, что там по тестам')

        user.step = 8
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage.js');
            if (saved) console.log('tests_reminder saved');
        });
    }
})


HRBot.action("waiting_for_tests",async (ctx) => {
    console.log('waiting_for_tests')
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });

    if(user && user.stage===2 && user.step === 7){

        user.step = 8
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in secondStage.js');
            if (saved) console.log('tests_reminder saved');
        });

        sendMessage(ctx.chat.id,'Что-то долго, поторопись )')
    }
})