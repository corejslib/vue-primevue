<template>
    <ext-dialog height="98%" layout="fit" width="95%" @ready="_ready"/>
</template>

<script>
import telegramComponents from "#src/components/telegram/components";

export default {
    "props": {
        "telegramBotRecord": {
            "type": Object,
            "required": true,
        },
    },

    "methods": {
        async _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.setTitle( this.telegramBotRecord.get( "name" ) );

            cmp.getHeader().insert( 0, [
                {
                    "xtype": "avatar",
                    "src": this.telegramBotRecord.get( "avatar_url" ),
                },
                {
                    "xtype": "spacer",
                    "width": 10,
                },
            ] );

            const panel = telegramComponents.get( this.telegramBotRecord.get( "type" ) ).panel;

            await this.$mount( panel, {
                "props": {
                    "telegramBotId": this.telegramBotRecord.id,
                },
            } );
        },
    },
};
</script>
