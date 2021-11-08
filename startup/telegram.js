// let dev = process.env.NODE_ENV == "dev";
let dev = 'dev'

const { Telegraf } = require("telegraf");
const config = require("../config/default");
const express = require("express");
const router = express.Router();
let HRBot;
//default params
let token = config.dev.botToken;

//developer mode or production?
if (dev) {
  token = config.dev.botToken;
  HRBot = new Telegraf(token);
} else {
  token = config.prod.botToken;
  HRBot = new Telegraf(token);
//   HRBot.setWebHook(`${config.prod.url}/bot`);
}

router.post("/", (req, res) => {
  const { body } = req;
  HRBot.processUpdate(body);
  res.status(200).send("ok");
});

HRBot.launch()

module.exports = {
  router,
  HRBot
};
