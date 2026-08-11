export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "fields": [
        "id",

        // fields
        "name",
        "description",
        "channels",

        // calculated
        { "name": "title", "calculate": data => `<div class="notification-type-name">${ data.name }</div>${ data.description }` },

        {
            "name": "enabled",
            "type": "bool",
            calculate ( data ) {
                if ( data.channels ) {
                    for ( const channel of Object.values( data.channels ) ) {
                        if ( channel.enabled ) return true;
                    }
                }

                return false;
            },
        },

        {
            "name": "editable",
            "type": "bool",
            calculate ( data ) {
                if ( data.channels ) {
                    for ( const channel of Object.values( data.channels ) ) {
                        if ( channel.editable ) return true;
                    }
                }

                return false;
            },
        },

        {
            "name": "subscribed",
            "type": "bool",
            calculate ( data ) {
                if ( data.channels ) {
                    for ( const channel of Object.values( data.channels ) ) {
                        if ( channel.editable && channel.subscribed ) return true;
                    }
                }

                return false;
            },
        },
    ],
} );
