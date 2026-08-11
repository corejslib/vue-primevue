<template>
    <ext-container>
        <!-- device dart mode -->
        <OptionContainer :description="l10n(`User your device dark mode settings`)" :label="l10n(`Device dark mode`)" labelWidth="260">
            <template #option>
                <DeviceDarkModeButton label=""/>
            </template>
        </OptionContainer>

        <ext-spacer height="20"/>

        <!-- dart mode -->
        <OptionContainer :description="l10n(`Toggle dark mode`)" :label="l10n(`Dark mode`)" labelWidth="260">
            <template #option>
                <DarkModeButton :disabled="deviceDarkMode" :hideLabel="true"/>
            </template>
        </OptionContainer>

        <ext-spacer height="20"/>

        <!-- base color -->
        <OptionContainer :description="l10n(`Interface base color`)" :label="l10n(`Base color`)" labelWidth="260">
            <template #option>
                <ext-dataview inline="true" @childtap="themeBaseChanged" @ready="themesColorsViewReady"/>
            </template>
        </OptionContainer>

        <ext-spacer height="20"/>

        <!-- accent color -->
        <OptionContainer :description="l10n(`Color for badges, etc.`)" :label="l10n(`Accent color`)" labelWidth="260">
            <template #option>
                <ext-componentdataview inline="true" @childtap="themeAccentChanged" @ready="themesColorsViewReady"/>
            </template>
        </OptionContainer>
    </ext-container>
</template>

<script>
import DarkModeButton from "#src/components/dark-mode.button";
import DeviceDarkModeButton from "#src/components/device-dark-mode.button";
import OptionContainer from "#src/components/option.container";

export default {
    "components": { DarkModeButton, DeviceDarkModeButton, OptionContainer },

    "computed": {
        deviceDarkMode () {
            return this.$app.theme.deviceDarkMode;
        },
    },

    "methods": {
        themesColorsViewReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setItemTpl( `
                        <div style="cursor:pointer;margin:5px 5px 5px 5px;border:1px dotted">
                            <div style="width:30px;height:40px;background-color:{color}" data-qtip="{title}"></div>
                        </div>
                    ` );

            const colors = Ext.theme.Material.getColors();

            const store = new Ext.data.Store( {
                "data": Object.keys( colors )
                    .sort()
                    .map( name => {
                        return {
                            "name": name,
                            "title": name.replaceAll( /(-.)/gv, match => match.replace( "-", " " ).toUpperCase() ).replace( /^./v, match => match.toUpperCase() ),
                            "color": colors[ name ][ 500 ],
                        };
                    } ),
            } );

            cmp.setStore( store );
        },

        themeBaseChanged ( e ) {
            const record = e.detail.location.record;

            this.$app.theme.theme = { "base": record.get( "name" ) };
        },

        themeAccentChanged ( e ) {
            const record = e.detail.location.record;

            this.$app.theme.theme = { "accent": record.get( "name" ) };
        },
    },
};
</script>
