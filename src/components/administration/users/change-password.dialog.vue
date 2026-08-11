<script>
import ChangePasswordDialog from "#src/components/change-password.dialog";

export default {
    "extends": ChangePasswordDialog,

    "methods": {
        async _changePassword ( password ) {
            return this.$api.call( "administration/users/set-password", this.userRecord.id, password );
        },
    },
};
</script>
