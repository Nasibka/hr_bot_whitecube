const {google} = require('googleapis');
const {OAuth2} = google.auth;
const keys = require("../../config/calendar")

const client_id=keys.client_id
const client_secret=keys.client_secret
const refresh_token = keys.refresh_token

const oAuth2Client = new OAuth2(client_id,client_secret)
oAuth2Client.setCredentials({refresh_token:refresh_token})

const calendar = google.calendar({version: 'v3', auth:oAuth2Client});

const startDate = new Date()
startDate.setDate(startDate.getDate()+2)

const endDate = new Date()
endDate.setDate(endDate.getDate()+2)

endDate.setMinutes(endDate.getMinutes()+45)

const event ={
    summary:'Birthday',
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

calendar.freebusy.query({
    resource:{
        timeMin:startDate,
        timeMax:endDate,
        timeZone:'Asia/Almaty',
        items:[{ id: 'primary' }]
    },
},(err,res)=>{
    if(err) return console.log('free busy query :' + err)


    const envetsArr = res.data.calendars.primary.busy
    if(envetsArr.length===0) return calendar.events.insert(
        {calendarId:'primary',resource:event},
        err=>{
            if(err) return console.log('error in inserting event :'+ err)

            return console.log('Event is created ')
        }

    )
    return console.log('cell is busy')
})


// function listEvents(auth) {
//   const calendar = google.calendar({version: 'v3', auth});
//   calendar.events.list({
//     calendarId: 'primary',
//     timeMin: (new Date()).toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const events = res.data.items;
//     if (events.length) {
//       console.log('Upcoming 10 events:');
//       events.map((event, i) => {
//         const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);
//       });
//     } else {
//       console.log('No upcoming events found.');
//     }
//   });
// }