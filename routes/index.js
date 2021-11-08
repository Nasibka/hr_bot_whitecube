const express = require("express");
const router = express.Router();

// mongo models
// const USER = require("../models/user");
// const FILTER = require("../models/filter");
// const CITY = require("../models/city");
// const STORY = require("../models/story");

router.use("/sozvon1", require("./sozvon_1"));

router.get("/", async (req, res) => {
    res.send('kek');
})



module.exports = router;
