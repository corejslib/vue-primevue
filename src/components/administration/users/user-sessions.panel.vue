<script>
import UserSessionsPanel from "#src/components/user-sessions/panel";

export default {
    "extends": UserSessionsPanel,

    "methods": {
        async _loadSessions () {
            return this.$api.call( "administration/users/get-sessions", this.userRecord.id );
        },

        async _signOutSessionRequest ( sessionId ) {
            return this.$api.call( "administration/users/sign-out-session", this.userRecord.id, sessionId );
        },

        async _signOutAllSessionsRequest ( e ) {
            return this.$api.call( "administration/users/sign-out-all-sessions", this.userRecord.id );
        },
    },
};
</script>
