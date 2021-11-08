const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
{
    chat_id: {
      type: Number,
      required: true,
    },
    username:{
      type: String,
      default:''
    },
    name: {
      type: String,
      default:''
    },
    surname: {
      type: String,
      default:''
    },
    phone: {
      type: String,
      default:''
    },
    step: {
      type: Number,
      default: 0,
    },
    stage:{
      type: Number,
      default: 1,
    },
    vacancy:{
      type: String, 
      default:''
    },
    hh_resume:{
      type: String,
      default:''
    },
    sozvon_1:{
      type: String,
      default:''
    },
    ntf_1_sent:{
      type:Boolean,
      default:false
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    tests_reminder:{
      type: Date,
      default: null
    },
    tests_reminder_sent:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("candidate", CandidateSchema);
