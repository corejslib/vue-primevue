<template>
    <ext-dialog :height="height" :layout="layout" scrollable="true" :title="_title" :width="width">
        <UsersPanel/>
    </ext-dialog>
</template>

<script>
import UsersPanel from "./panel";

export default {
    "components": { UsersPanel },

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
            return this.title || l10n( "Users" );
        },
    },
};
</script>
