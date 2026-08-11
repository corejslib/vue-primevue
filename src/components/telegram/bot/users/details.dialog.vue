<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" width="600">
        <DetailsPanel :telegramBotRecord="telegramBotRecord" :telegramBotUserRecord="telegramBotUserRecord"/>
    </ext-dialog>
</template>

<script>
import DetailsPanel from "./details.panel";

export default {
    "components": { DetailsPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "required": true,
        },
        "telegramBotUserRecord": {
            "type": Object,
            "required": true,
        },
    },

    "computed": {
        title () {
            return l10n( "Bot user" ) + ": " + this.telegramBotUserRecord.get( "full_name" );
        },
    },

    "methods": {},
};
</script>
