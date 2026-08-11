<template>
    <ext-dialog bodyPadding="0" :closable="closable">
        <AuthPanel :closable="closable" :resetPasswordEnabled="resetPasswordEnabled" :shadow="shadow" @close="onClose"/>
    </ext-dialog>
</template>

<script>
import AuthPanel from "./panel";

export default {
    "components": { AuthPanel },

    "props": {
        "resetPasswordEnabled": {
            "type": Boolean,
            "default": true,
        },
        "closable": {
            "type": Boolean,
            "default": false,
        },
        "shadow": {
            "type": Boolean,
            "default": true,
        },
    },

    "methods": {
        onClose () {
            this.ext.close();
        },
    },
};
</script>
