<template>
    <ext-dialog height="90%" layout="fit" :title="title" width="600">
        <RolesPanel ref="rolesPanel" :aclId="aclId" :userId="userId" :userRecord="userRecord" @update="_onRolesUpdate"/>
    </ext-dialog>
</template>

<script>
import RolesPanel from "#src/components/acl/roles.panel";

export default {
    "components": { RolesPanel },

    "props": {
        "aclId": {
            "type": Number,
            "required": true,
        },
        "userRecord": {
            "type": Object,
            "required": true,
        },
    },

    "computed": {
        userId () {
            return this.userRecord.id;
        },

        title () {
            return l10n( "Edit user roles" );
        },
    },

    "methods": {

        // protected
        _onRolesUpdate ( roles ) {
            this.userRecord.set( "roles", roles );
        },
    },
};
</script>
