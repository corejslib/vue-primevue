<template>
    <ext-dialog height="90%" layout="fit" :title="titleText" width="800">
        <AclPanel :aclId="aclId"/>
    </ext-dialog>
</template>

<script>
import AclPanel from "#src/components/acl/panel";

export default {
    "components": { AclPanel },

    "props": {
        "aclId": {
            "type": Number,
            "required": true,
        },
        "title": {
            "type": String,
            "default": "",
        },
    },

    "computed": {
        titleText () {
            return this.title || l10n( "Users" );
        },
    },
};
</script>
