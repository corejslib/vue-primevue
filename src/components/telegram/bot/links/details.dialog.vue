<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" width="600">
        <LinkDetailsPanel :telegramBotLinkRecord="telegramBotLinkRecord" :telegramBotRecord="telegramBotRecord" @linkDelete="_onLinkDelete"/>
    </ext-dialog>
</template>

<script>
import LinkDetailsPanel from "./details.panel";

export default {
    "components": { LinkDetailsPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "required": true,
        },
        "telegramBotLinkRecord": {
            "type": Object,
            "required": true,
        },
    },

    "emits": [ "linkDelete" ],

    "computed": {
        title () {
            return l10n( "Bot link" ) + ": " + this.telegramBotLinkRecord.get( "name" );
        },
    },

    "methods": {
        _onLinkDelete ( record ) {
            this.$emit( "linkDelete", record );

            this.ext.close();
        },
    },
};
</script>
