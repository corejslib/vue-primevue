<script>
import TelegramBotsPanel from "#src/components/telegram/bots.panel";

export default {
    "extends": TelegramBotsPanel,

    "methods": {
        _getStoreApiMethod () {
            return "administration/telegram/bots/get-bots-list";
        },
    },
};
</script>
