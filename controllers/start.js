const { HRBot } = require("../startup/telegram");
const { sendMessage, inlineKeyboard } = require("../helpers/bot");
const { addCell, getVacanciesButtons,getVacancies, createFolder, addFile} = require('../google_services/actions')
const texts = require("../constants/texts");
const kboard = require("../constants/keyboard");
const CANDIDATE = require("../models/candidate");

const phone_regex = /^(\+7|8|7){1}[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{2}[-\s\.]?[0-9]{2}$/im;
const vacancy_regex = /vacancy\d$/;
let vacanciesButtons = []
let vacancies = []
let vac_callbacks = []


HRBot.start(async (ctx) => {
    var date = getDate();
    console.log('start clicked:'+new Date())
    const newUser = {
        chat_id: ctx.chat.id,
        step:0,
        stage:1,
        username: ctx.from.username,
        createdAt:new Date()
    };
    
    let user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
   
    if(!user){
        user = new CANDIDATE(newUser);
        user.save();
        sendMessage(ctx.chat.id, texts.welcome, inlineKeyboard(kboard.welcome));

        await addCell(ctx.chat.id,'CHAT_ID',ctx.chat.id) 
        await addCell(ctx.chat.id,'Дата регистрации',date)
    }else{
        console.log(user)
        sendMessage(ctx.chat.id, 'Ky-ky');
    }  
});


// ПРИНИМАЕМ CALLBACK НАЖАТЫХ INLINE КНОПОК //

HRBot.action("go_away", (ctx) => {
    sendMessage(ctx.chat.id,'Можете ознакомиться по ссылке: https://whitecube.kz/hr');
})

HRBot.action("lets_go", (ctx) => {
    sendMessage(ctx.chat.id,texts.pay_attention,inlineKeyboard(kboard.pay_attention,true));
})

HRBot.action("start", (ctx) => {
    sendMessage(ctx.chat.id,texts.hello,inlineKeyboard(kboard.yes_no,true));
})

HRBot.action("goodbye", (ctx) => {
    sendMessage(ctx.chat.id,'На нет и суда нет. Спасибо!');
})

HRBot.action("yes",async (ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage==1 ){
        let vacancy
        if(user.vacancy!==''){
            vacancy = vacancies.find(({text})=>text===user.vacancy)
        }
        switch(user.step){
            case 0:
                console.log(user)
                user.step = 1
                user.save();
                sendMessage(ctx.chat.id,texts.register);
                break;
            case 1:
                user.step = 2
                user.save();
                sendMessage(ctx.chat.id,texts.ask_surname);
                break;
            case 2:
                user.step = 3
                user.save();
                sendMessage(ctx.chat.id,texts.ask_phone);  
                break;
            case 3:
                user.step = 4
                user.save();
                sendMessage(ctx.chat.id,texts.choose_vacancy,inlineKeyboard(vacanciesButtons));  
                break;
            case 6:
                user.step = 7
                user.save();
                sendMessage(ctx.chat.id,texts.first_q+vacancy.q_1);
                break;
            case  11:
                user.step = 12
                user.save();
                sendMessage(ctx.chat.id,"Напиши свой аккаунт :)");
                break;
            default:
                break;
        }
    }
})

HRBot.action("no", async(ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });

    if(user && user.chat_id && user.stage===1){
        switch(user.step){
            case 0:
                user.step = -1
                user.save();
                sendMessage(ctx.chat.id,texts.bye);
                break;
            case 1:                
                sendMessage(ctx.chat.id,texts.change_name);
                break;
            case 2:
                sendMessage(ctx.chat.id,texts.change_surname);
                break;
            case 3:
                sendMessage(ctx.chat.id,texts.change_phone);
                break;
            case 6:
                user.step = -1
                user.save();
                sendMessage(ctx.chat.id,'Очень жаль, что вас не заинтересовало😢 Всего доброго.');
                break;
            case 11:
                user.step = 13
                user.save();
                addCell(user.chat_id,'Соцсети','нет')
                sendMessage(ctx.chat.id,"Ну, ничего страшного :) "+ texts.ask_about);
                break;
        }
    }
})
 
HRBot.on('text', async(ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage===1){
        let vacancy
        if(user.vacancy!==''){
            vacancy = vacancies.find(({text})=>text===user.vacancy)
        }
        
        switch(user.step){
            case 1:
                user.name = ctx.message.text
                user.save();
                addCell(user.chat_id,'Имя',ctx.message.text)
                sendMessage(ctx.chat.id,ctx.message.text+' ,проверь правильно ли ты написал свое имя?',inlineKeyboard(kboard.yes_no))
                break;
            case 2:
                user.surname = ctx.message.text
                user.save();
                addCell(user.chat_id,'Фамилия',ctx.message.text)
                sendMessage(ctx.chat.id,ctx.message.text+' ,проверь правильно ли ты написал свою фамилию?',inlineKeyboard(kboard.yes_no))
                break;
            case 3:
                if(ctx.message.text.match(phone_regex)){
                    user.phone = ctx.message.text
                    user.save();
                    addCell(user.chat_id,'Телефон',ctx.message.text)
                    sendMessage(ctx.chat.id,ctx.message.text+' ,проверь правильно ли ты написал свой номер?',inlineKeyboard(kboard.yes_no))
                    break; 
                }else{
                    sendMessage(ctx.chat.id,ctx.message.text+', недопустимый формат номера. Пример: 87771231212')
                    break;
                }
            case 5:
                sendMessage(ctx.chat.id,"Пожалуйста отправьте резюме в одном из форматов: pdf, doc, jpg, jpeg, png.")
                break;
            case 7:
                user.step=8
                user.save();
                addCell(user.chat_id,'1 вопрос',ctx.message.text)
                sendMessage(ctx.chat.id,texts.second_q+vacancy.q_2);
                break;
            case 8:
                user.step=9
                user.save();
                addCell(user.chat_id,'2 вопрос',ctx.message.text)
                sendMessage(ctx.chat.id,texts.third_q+vacancy.q_3);
                break;
            case 9:
                user.step=10
                user.save();
                addCell(user.chat_id,'3 вопрос',ctx.message.text)
                sendMessage(ctx.chat.id,texts.fourth_q+vacancy.q_4);  
                break;
            case 10:
                user.step=11
                user.save();
                addCell(user.chat_id,'4 вопрос',ctx.message.text)
                sendMessage(ctx.chat.id,texts.social_network,inlineKeyboard(kboard.social_network));
                break;
            case 12:
                user.step=13
                user.save();
                addCell(user.chat_id,'Соцсети',ctx.message.text)
                sendMessage(ctx.chat.id,texts.ask_about);
                break;
            case 13:
                user.step=14
                user.save();
                addCell(user.chat_id,'Кандидат',ctx.message.text)
                sendMessage(ctx.chat.id,texts.wait);
                break;
            case 14:
                sendMessage(ctx.chat.id,texts.wait);
                break;
        }
    }
})

HRBot.action(vacancy_regex, async(ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    const vacancy = vacanciesButtons.flat(1).find(({callback_data}) => callback_data === ctx.callbackQuery.data)  
    if(user && user.chat_id && user.step===4){
        user.step = 5
        user.vacancy = vacancy.text
        user.save();
        addCell(user.chat_id,'Вакансия',vacancy.text)
        sendMessage(ctx.chat.id,texts.hh_resume,inlineKeyboard(kboard.hh_resume));
    }
})

HRBot.on('document',async (ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage===1 && user.step===5){
        const vacancy = vacancies.find(({text})=>text===user.vacancy)
        const fileID = ctx.message.document.file_id
        const link = await HRBot.telegram.getFileLink(fileID)
        user.hh_resume = link
        user.step = 6
        user.save();
        addCell(user.chat_id,'Резюме',link)
        sendMessage(ctx.chat.id,'Отлично. '+ texts.video.replace('{vacancy_video}',vacancy.video_link).replace('{vacancy_text}',vacancy.text_link),inlineKeyboard(kboard.yes_no))

        // const parentFolder = await createFolder(user.chat_id)
        // ctx.telegram.getFileLink(fileID).then(url => {    
        //     axios({url, responseType: 'stream'}).then(response => {
        //         return new Promise(async (resolve, reject) => {
        //             response.data.pipe(fs.createWriteStream(`${__dirname}/${user.chat_id}`))
        //                         .on('finish', () => {addFile(`${__dirname}/${user.chat_id}`, parentFolder, 'resume')})
        //                         .on('error', e => {console.log(e)} )
        //         });
        //     })
        // })        
    }
})

HRBot.on('photo', async(ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });
    if(user && user.chat_id && user.stage===1 && user.step===5){
        vacancy = vacancies.find(({text})=>text===user.vacancy)
        const fileID = ctx.message.photo[1].file_id
        const link = await HRBot.telegram.getFileLink(fileID)
        user.hh_resume = link
        user.step = 6
        user.save();
        addCell(user.chat_id,'Резюме',link)
        sendMessage(ctx.chat.id,'Отлично. '+ texts.video.replace('{vacancy_video}',vacancy.video_link).replace('{vacancy_text}',vacancy.text_link),inlineKeyboard(kboard.yes_no))
    }
})

HRBot.action('skip', async(ctx) => {
    const user = await CANDIDATE.findOne({ chat_id: ctx.chat.id });

    if(user && user.chat_id && user.stage===1 && user.step===5){
        vacancy = vacancies.find(({text})=>text===user.vacancy)

        user.step = 6
        user.resume = 'Нет'
        user.save();
        addCell(user.chat_id,'Резюме','Нет')
        sendMessage(ctx.chat.id,'Ничего страшного. '+ texts.video.replace('{vacancy_video}',vacancy.video_link).replace('{vacancy_text}',vacancy.text_link),inlineKeyboard(kboard.yes_no))
    }  
})


//functions

async function getVac(){
    vacanciesButtons = []
    vac_callbacks = []
    vacanciesButtons = await getVacanciesButtons()
    vacanciesButtons.forEach(obj => {
        vac_callbacks.push(obj[0].callback_data)   
    })

    vacancies = []
    vacancies = await getVacancies()
}
getVac()

function getDate(){
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1;
    var day = today.getDate();
    var date =day+"."+month+"."+year;
    return date;
}