<template>
    <ext-panel layout="hbox">
        <BotInfoPanel flex="1" :telegramBotId="telegramBotId"/>

        <BotChartsPanel minWidth="400" resizable='{"edges":"west","snap":200,"split":true}' scrollable="true" :telegramBotId="telegramBotId" width="400"/>
    </ext-panel>
</template>

<script>
import BotChartsPanel from "./charts.panel";
import BotInfoPanel from "./info.panel";

export default {
    "components": { BotInfoPanel, BotChartsPanel },

    "props": {
        "telegramBotId": {
            "type": Number,
            "required": true,
        },
    },
};
</script>
