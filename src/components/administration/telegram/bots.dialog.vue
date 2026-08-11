<template>
    <ext-dialog :height="height" :layout="layout" scrollable="true" :title="_title" :width="width">
        <TelegramBotsPanel/>
    </ext-dialog>
</template>

<script>
import TelegramBotsPanel from "./bots.panel";

export default {
    "components": { TelegramBotsPanel },

    "props": {
        "title": {
            "type": String,
            "default": "",
        },
        "width": {
            "type": String,
            "default": "90%",
        },
        "height": {
            "type": String,
            "default": "90%",
        },
        "layout": {
            "type": String,
            "default": "fit",
        },
    },

    "computed": {
        _title () {
            return this.title || l10n( "Bots" );
        },
    },
};
</script>
