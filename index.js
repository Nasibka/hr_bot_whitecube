// let dev = process.env.NODE_ENV == "dev";
let dev = 'dev';
const CANDIDATE = require("./models/candidate");


const config = require("./config/default");
const winston = require("winston");
const express = require("express");
const app = express();
let port;


if (dev) {
    port = config.dev.port;
} else {
    port = config.prod.port;
}
  
require("./startup/db")();
require("./startup/routes")(app);
require("./controllers/start");
require("./controllers/secondStage");
require("./controllers/cron");


const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);


async function kek(){
  // const user = await CANDIDATE.findOne({username:'nasyaba'});


  // user.sozvon_1 = new Date(1605174500000)
  // user.save((err, saved) => {
  //   if(err) console.log(err, ' ,error in secondStage js');
  //   if(saved) console.log('step 1 stage 2 saved');
  // });
  // console.log(user)

    // await CANDIDATE.deleteOne({chat_id:287016579}, function (err) {
    //     if(err)  return console.log(err);
    //     console.log('deleted')
    // });

    const users = await CANDIDATE.find({});
    console.log(users)

    // CANDIDATE.find({username:'nasyaba'}, function(err, result) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(result);
    //     }
    // });
}
kek() 
