module.exports = {
    welcome:[[{text:"Ну интересно посмотреть, чего",callback_data:'lets_go'}],[{text:"Вы кто такие? Я Вас не звал!",callback_data:'go_away'}]],
    yes_no: [[{text:"Да",callback_data:'yes'},{text:"Нет",callback_data:'no'}]],
    ready_to_move_on: [[{text:"Да,готов",callback_data:'ready'},{text:"Нет, ну нафиг",callback_data:'not_ready'}]],
    pass_tests: [[{text:"Хорошо",callback_data:'send_tests'},{text:"Нет, ну нафиг",callback_data:'dont_send_tests'}]],
    passed_tests: [[{text:"Да, прошёл",callback_data:'check_tests'},{text:"Нет, не прошел",callback_data:'waiting_for_tests'}]],
    pay_attention:[[{text:"Ладно, валяй",callback_data:'start'},{text:"Нет",callback_data:'goodbye'}]],
    hh_resume: [[{text:"У меня нет резюме",callback_data:'skip'}]],
    social_network:[[{text:"Да, давай",callback_data:'yes'}],[{text:"Нет аккаунта ",callback_data:'no'}]],
    sozvon1:[[{text:"Да, в силе",callback_data:'sozvon1_yes'}],[{text:"Нет, не получается",callback_data:'sozvon1_no'}]],
  };
  