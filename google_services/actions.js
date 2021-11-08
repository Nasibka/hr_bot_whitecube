const {doc, googleDriveInstance} = require('./index')
const {calendar} = require('./calendar')
const days = require("../constants/days");
const moment = require('moment');

//actions on google spreadsheet 
async function addRow(array){
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]

    await sheet.loadCells();
    const rows = await sheet.getRows()
    const headers = sheet.headerValues

    for(var i = 0;i<array.length;i++){
        const cellA1 = sheet.getCell(rows.length+1, i);
        cellA1.value = array[i]
        await sheet.saveUpdatedCells();
    }
}

async function addCell(chat_id, column_name, value){
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const row = rows.find(({CHAT_ID}) => CHAT_ID == chat_id)
    if(row){
        // console.log(row,26)
        row[column_name] = value
        row.save()
    }else{
        await sheet.addRow({ CHAT_ID:chat_id});
    } 
}

async function getVacanciesButtons(){
    let array=[];
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1]

    const rows = await sheet.getRows()
    for(var i= 0;i<rows.length;i++){
        const vacancy = rows[i]['Вакансии']
        array.push([{text:vacancy,callback_data:'vacancy'+i}])
    }
    return array;
}

async function getVacancies(){
    let array=[];
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1]

    const rows = await sheet.getRows()
    for(var i= 0;i<rows.length;i++){
        const vacancy = rows[i]['Вакансии']
        const q_1 = rows[i]['1 вопрос']
        const q_2 = rows[i]['2 вопрос']
        const q_3 = rows[i]['3 вопрос']
        const q_4 = rows[i]['4 вопрос']
        const video_link = rows[i]['Ссылка на видео']
        const text_link =  rows[i]['Ссылка на описание']
        const dates = rows[i]['Время Собеседования']
        const tests_links = rows[i]['Ссылки на тесты']
        array.push({
            text:vacancy,
            video_link:video_link,
            text_link:text_link,
            q_1:q_1,
            q_2:q_2,
            q_3:q_3,
            q_4:q_4,
            dates:dates,
            tests_links:tests_links
        })
    }
    return array;
}

async function getTestsLinks(vacName){
    let vacancies = await getVacancies()
    let vac = vacancies.find(({text})=>text===vacName)
    return vac.tests_links

}

async function getTimetable(vacName,currentTime){
    let timetable = []
    let vacancies = await getVacancies()
    let vac = vacancies.find(({text})=>text===vacName)
    const google_sheet_time = vac.dates.split(',')

    const today = moment(currentTime).format('dddd')
    // console.log(moment(currentTime).format('do mmm yyyy, h:mm:ss a'))
    const currentDayNumber =  days.find(({name})=>name===today[0].toUpperCase()+today.slice(1)).number

    let nextWeek = []
    let thisWeek = []

    for(t of google_sheet_time){
        const day = t.split('-')[0]
        const end = t.split('-')[2]
        const numberOfWeek = days.find(({name})=>name===day.trim()).number

        const b = moment().startOf('week').add(numberOfWeek,'days').toDate()
        b.setHours(end.split(':')[0],end.split(':')[1],0)

        if(currentDayNumber>=numberOfWeek){
            if(currentTime>=b.getTime()-600000){
                nextWeek.push(numberOfWeek)
            }else{
                thisWeek.push(numberOfWeek)
            }
        }else{
            thisWeek.push(numberOfWeek)
        }
    }
    // console.log('this week: '+thisWeek)
    // console.log('next week: '+nextWeek)
    
    for(t of google_sheet_time){
        const day = t.split('-')[0]
        const start = t.split('-')[1]
        const end = t.split('-')[2]
        const startHours = parseInt(start.split(':')[0])
        const startMinutes = parseInt(start.split(':')[1])
        const numberOfWeek = days.find(({name})=>name===day.trim()).number

        const a = moment().startOf('week').add(numberOfWeek,'days').toDate()
        const b = moment().startOf('week').add(numberOfWeek,'days').toDate()
        a.setHours(start.split(':')[0],start.split(':')[1],0)
        b.setHours(end.split(':')[0],end.split(':')[1],0)
        const range = (b.getTime()-a.getTime())/1000/60
        let rangeArr = []
        for (let i = 0; i < range; i+=10) {
            rangeArr.push(i);
        }

        if(thisWeek.length>0 && thisWeek.includes(numberOfWeek)){
            let oneDay = await Promise.all(rangeArr.map(async (time)=>{
                let result = []
                let temp =new Date()
                let temp2 =new Date()
                temp = moment().startOf('week').add(numberOfWeek,'days').toDate()
                temp2 = moment().startOf('week').add(numberOfWeek,'days').toDate()

                temp.setHours(startHours,startMinutes+time,0)
                temp2.setHours(startHours,startMinutes+time+10,0)

                if(currentTime<temp.getTime()){
                    result.push(temp,temp2)
                }
                return result;
            }));
            var filtered = oneDay.filter(function (el) { 
                return el[0] != null; 
            });

            let obj = {}
            obj[numberOfWeek]=filtered
            timetable.push(obj)
        }else if(thisWeek.length===0){
            let oneDay = await Promise.all(rangeArr.map(async (time)=>{
                let result = []
                let temp =new Date()
                let temp2 =new Date()
                temp = moment().startOf('week').add(numberOfWeek+7,'days').toDate()
                temp2 = moment().startOf('week').add(numberOfWeek+7,'days').toDate()

                temp.setHours(startHours,startMinutes+time,0)
                temp2.setHours(startHours,startMinutes+time+10,0)

                if(currentTime<temp.getTime()){
                    result.push(temp,temp2)
                }
                return result;
            }));
            var filtered = oneDay.filter(function (el) { 
                return el[0] != null; 
            });

            let obj = {}
            obj[numberOfWeek]=filtered
            timetable.push(obj)
        }
    }
    return timetable;
}

//actions on google drive
async function createFolder(name){
    let newFolder = { name: name },
        createFolderResponse = await googleDriveInstance.createFolder(
            null,
            newFolder.name
        );
 
    newFolder.id = createFolderResponse.id;

    console.log(`Created folder ${newFolder.name} with id ${newFolder.id}`);

    return newFolder.id
 
}

async function addFile(file,parent_folder,name){
    await googleDriveInstance.writeFile(
        file,
        parent_folder,
        name,
        null,
        {
            destinationMimeType: 'application/vnd.google-apps.document'
        }
    );
    console.log('File added')
}

////actions on google calendar
async function checkBusy(startDate,endDate){
    return new Promise(function(resolve, reject) {
        calendar.freebusy.query({
            resource:{
                timeMin:startDate,
                timeMax:endDate,
                timeZone:'Asia/Almaty',
                items:[{ id: 'primary' }]
            },
        },(err,res)=>{
            if(err) return console.log('free busy query :' + err)

            const eventsArr = res.data.calendars.primary.busy
            let isBusy
            if(eventsArr.length===0){
                isBusy = false
            }else{
                isBusy = true
            }

            resolve(isBusy)
    
            // console.log("TIME IS BUSY")
            // console.log(eventsArr)
            // return true
        })
      });
    
}

function insertEvent(name,description,startDate,endDate){
    const event ={
        summary:name,
        description:description,
        start:{
            dateTime:startDate,
            timeZone: 'Asia/Almaty'
        },
        end:{
            dateTime:endDate,
            timeZone: 'Asia/Almaty'
        },
        colorId:1,
    }

    calendar.events.insert(
        {calendarId:'primary',resource:event},
        err=>{
            if(err) return console.log('error in inserting event :'+ err)

            return console.log('Event is created ')
        }
    )

}


module.exports = {
    addCell,
    getVacanciesButtons,
    getVacancies,
    getTestsLinks,
    getTimetable,
    createFolder,
    addFile,
    checkBusy,
    insertEvent
};