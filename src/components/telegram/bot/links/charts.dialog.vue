<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" viewModel="true" width="90%">
        <CharstPanel period="3 months" :telegramBotLinkRecord="telegramBotLinkRecord" :telegramBotRecord="telegramBotRecord"/>
    </ext-dialog>
</template>

<script>
import CharstPanel from "./charts.panel";

export default {
    "components": { CharstPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "default": null,
        },
        "telegramBotLinkRecord": {
            "type": Object,
            "required": true,
        },
    },

    "computed": {
        title () {
            return l10n( "Bot link charts" );
        },
    },

    "methods": {},
};
</script>
