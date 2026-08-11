<template>
    <ext-dialog height="98%" layout="fit" width="85%" @ready="_ready">
        <LinksPanel :telegramBotId="telegramBotRecord.id"/>
    </ext-dialog>
</template>

<script>
import LinksPanel from "./panel";

export default {
    "components": { LinksPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "required": true,
        },
    },

    "methods": {
        async _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.setTitle( this.telegramBotRecord.get( "name" ) + " / " + l10n( "Links" ) );

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
        },
    },
};
</script>
