import app from "#app";
import Events from "#core/events";
import result from "#core/result";

class TelegramComponent {
    #components = {};
    #events = new Events();

    // properties
    get hasPublicComponents () {
        for ( const component of Object.values( this.#components ) ) {
            if ( !component.isPrivate ) return true;
        }

        return false;
    }

    // public
    get ( id ) {
        return this.#components[ id ];
    }

    add ( component ) {
        if ( this.#components[ component.id ] ) {
            throw new Error( `Telegram bot id ${ component.id } already registered` );
        }

        this.#components[ component.id ] = component;
    }

    on ( name, listener ) {
        this.#events.on( name, listener );

        return this;
    }

    once ( name, listener ) {
        this.#events.once( name, listener );

        return this;
    }

    off ( name, listener ) {
        this.#events.off( name, listener );

        return this;
    }

    emit ( name, ...args ) {
        this.#events.emit( name, ...args );

        return this;
    }

    async getRegisteredComponents () {
        const res = await app.api.call( "telegram/bots/get-registered-components" );

        if ( !res.ok ) return res;

        const components = [];

        for ( const row of res.data ) {
            const component = this.#components[ row.id ];

            if ( component ) {
                component.model.set( "name", row.name );
                component.model.set( "description", row.description || row.name );
                component.model.set( "short_description", row.short_description || row.description || row.name );

                component.model.set( "locales", row.locales );

                components.push( component );
            }
        }

        return result( 200, components );
    }
}

export default new TelegramComponent();
