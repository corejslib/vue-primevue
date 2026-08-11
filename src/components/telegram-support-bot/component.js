import TelegramBotComponent from "#src/components/telegram/bot/component";

class Component extends TelegramBotComponent {

    // propertirs
    get id () {
        return "telegramSupportBot";
    }

    get panel () {
        return import( /* webpackChunkName: "telegram-support-bot" */ "./panel" );
    }
}

export default new Component();
