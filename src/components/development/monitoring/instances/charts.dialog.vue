<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" viewModel="true" width="90%">
        <CharstPanel period="30 days" :record="record" :showMaximizeButton="false"/>
    </ext-dialog>
</template>

<script>
import CharstPanel from "./charts.panel";

export default {
    "components": { CharstPanel },

    "props": {
        "record": {
            "type": Object,
            "default": null,
        },
    },

    "computed": {
        title () {
            return l10n( "Instance stats" );
        },
    },

    "methods": {},
};
</script>
