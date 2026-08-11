import app from "#app";
import telegramComponents from "#src/components/telegram/components";
import TelegramComponentModel from "./models/component";

export default class TelegramBotComponent {
    model;

    constructor () {
        this.model = new TelegramComponentModel( {
            "id": this.id,
        } );

        telegramComponents.add( this );
    }

    // propertirs
    get id () {
        throw "Bot id is reqiored";
    }

    get name () {
        return this.model.get( "name" );
    }

    get description () {
        return this.model.get( "description" );
    }

    get shortDescription () {
        return this.model.get( "short_description" );
    }

    get panel () {
        return import( "./panel" );
    }

    // public
    async runWebApp ( panel ) {
        if ( app.telegram.webAppType === "bot-statistics" ) {
            return this._runBotStatisticsWebApp( panel );
        }
        else {
            return this._runWebApp( panel );
        }
    }

    // protected
    async _runWebApp ( panel ) {
        return app.telegram.close();
    }

    async _runBotStatisticsWebApp ( panel ) {
        return panel.$mount( import( "#vue/components/telegram/bot/details/charts.panel" ), {
            "props": {
                "telegramBotId": app.telegram.bot.id,
                "showMaximizeButton": false,
            },
        } );
    }
}
