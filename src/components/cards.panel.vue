<template>
    <ext-panel :hidden="hidden" layout="card" @ready="_ready">
        <!-- default panel -->
        <ext-panel ref="defaultPanel" layout="fit">
            <slot name="defaultPanel">
                <ext-panel :html="defaultMessage" layout="center" style="text-align: center"/>
            </slot>
        </ext-panel>

        <!-- no data panel -->
        <ext-panel ref="noDataPanel" layout="fit">
            <slot name="noDataPanel">
                <ext-panel :html="noDataMessageText" layout="center" style="text-align: center"/>
            </slot>
        </ext-panel>

        <!-- error panel -->
        <ext-panel ref="errorPanel" layout="fit">
            <slot name="errorPanel">
                <ext-container layout='{"align":"center","pack":"center","type":"vbox"}' style="text-align: center">
                    <ext-container :html="l10n(`Unable to load data`)"/>
                    <ext-container ref="errorMessage"/>
                    <ext-container height="10"/>
                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" ui="action" @tap="refresh"/>
                </ext-container>
            </slot>
        </ext-panel>

        <!-- data panel -->
        <ext-panel ref="dataPanel" layout="fit">
            <slot name="dataPanel"/>
        </ext-panel>

        <slot name="docked"/>
    </ext-panel>
</template>

<script>
export default {
    "props": {
        "hidden": {
            "type": Boolean,
            "default": false,
        },
        "store": {
            "type": Object,
            "default": null,
        },
        "showErrorMessage": {
            "type": Boolean,
            "default": true,
        },
        "defaultMessage": {
            "type": String,
            "default": "",
        },
        "noDataMessage": {
            "type": String,
            "default": "",
        },
        "loadMask": {
            "type": Object,
            "default": null,
        },
    },

    "emits": [ "render", "refresh", "storeLoad" ],

    data () {
        return {
            "isRendered": false,
        };
    },

    "computed": {
        noDataMessageText () {
            return this.noDataMessage || l10n( "No data match search criteria" );
        },
    },

    mounted () {
        if ( this.store ) this.watchStore( this.store );
    },

    unmounted () {
        this.unwatchStore( this.store );
    },

    "methods": {
        _ready ( e ) {
            const cmp = ( this.ext = e.detail.cmp );

            if ( cmp.rendered ) {
                this._onRender();
            }
            else {
                cmp.afterRender = () => this._onRender();
            }
        },

        _onRender () {
            this.isRendered = true;

            this.$emit( "render" );

            this.$emit( "refresh" );
        },

        refresh () {
            this.$emit( "refresh" );
        },

        mask ( mask ) {
            this.ext.mask( mask || this.loadMask );
        },

        unmask () {
            this.ext.unmask();
        },

        watchStore ( store ) {
            this._store = store;
            this._storeLoadCallback = this._onStoreLoad.bind( this );
            this._storeDataChangedCallback = this._onStoreDataChanged.bind( this );

            this._store.on( "load", this._storeLoadCallback );
            this._store.on( "datachanged", this._storeDataChangedCallback );
        },

        unwatchStore () {
            if ( !this._store ) return;

            this._store.removeListener( "load", this._storeLoadCallback );
            this._store.removeListener( "datachanged", this._storeDataChangedCallback );

            this._store = null;
            this._storeLoadCallback = null;
            this._storeDataChangedCallback = null;
        },

        setResult ( res ) {
            if ( !res.ok ) {
                this.showErrorPanel( res.statusText );
            }
            else {
                this.showDataPanel();
            }
        },

        showDefaultPanel () {
            this.ext.setActiveItem( this.$refs.defaultPanel.ext );

            this.unmask();
        },

        showErrorPanel ( message ) {
            if ( message && this.showErrorMessage ) {
                this.$refs.errorMessage.ext.setHtml( message + "" );
            }
            else {
                this.$refs.errorMessage.ext.setHtml( "" );
            }

            this.ext.setActiveItem( this.$refs.errorPanel.ext );

            this.unmask();
        },

        showNoDataPanel () {
            this.ext.setActiveItem( this.$refs.noDataPanel.ext );

            this.unmask();
        },

        showDataPanel () {
            this.ext.setActiveItem( this.$refs.dataPanel.ext );

            this.unmask();
        },

        _onStoreLoad ( store, records, success, eOpts ) {
            this.$emit( "storeLoad", store, records, success, eOpts );

            if ( !success ) {
                this.showErrorPanel( eOpts );
            }
            else if ( !store.getCount() ) {
                this.showNoDataPanel();
            }
            else {
                this.showDataPanel();
            }
        },

        _onStoreDataChanged ( store ) {
            if ( !store.getCount() ) {
                this.showNoDataPanel();
            }
            else {
                this.showDataPanel();
            }
        },
    },
};
</script>
