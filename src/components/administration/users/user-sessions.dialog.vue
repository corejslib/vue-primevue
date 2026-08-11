<template>
    <ext-dialog :height="height" layout="fit" scrollable="true" :title="l10n(`User sessions`)" :width="width">
        <UserSessionsPanel :userRecord="userRecord"/>
    </ext-dialog>
</template>

<script>
import UserSessionsPanel from "./user-sessions.panel";

export default {
    "components": { UserSessionsPanel },

    "props": {
        "userRecord": {
            "type": Object,
            "required": true,
        },
        "width": {
            "type": String,
            "default": "90%",
        },
        "height": {
            "type": String,
            "default": "90%",
        },
    },
};
</script>
