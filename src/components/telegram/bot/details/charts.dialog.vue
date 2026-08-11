<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" viewModel="true" width="90%">
        <CharstPanel :period="period" :showMaximizeButton="false" :telegramBotId="telegramBotId"/>
    </ext-dialog>
</template>

<script>
import CharstPanel from "./charts.panel";

export default {
    "components": { CharstPanel },

    "props": {
        "telegramBotId": {
            "type": Number,
            "required": true,
        },
        "period": {
            "type": String,
            "default": "3 months",
        },
    },

    "computed": {
        title () {
            return l10n( "Bot charts" );
        },
    },

    "methods": {},
};
</script>
