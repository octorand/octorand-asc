require('dotenv').config();

(async () => {
    await require('./command/01_main_application_create').execute();
    await require('./command/02_main_application_read').execute();
    await require('./command/03_main_application_update').execute();
    await require('./command/04_main_application_fund').execute();
    await require('./command/05_main_call_create_game').execute();
    await require('./command/06_game_application_read').execute();
    await require('./command/07_game_optin_players').execute();
    await require('./command/08_game_call_play').execute();
    await require('./command/09_game_call_update_name').execute();
    await require('./command/10_game_call_update_timer').execute();
    await require('./command/11_game_call_finish').execute();
    await require('./command/12_game_call_withdraw').execute();
    await require('./command/13_game_archive').execute();
    await require('./command/14_game_call_clean').execute();
    await require('./command/15_main_call_update_game').execute();
    await require('./command/16_main_call_clean').execute();
    await require('./command/06_game_application_read').execute();
})();