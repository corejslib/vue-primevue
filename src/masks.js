import loader from "./assets/loader.gif";

const maask = {
        "xtype": "mask",
        "transparent": false,
    },
    loadMaask = {
        "xtype": "loadmask",
        "transparent": false,
        "indicator": false,
        "message": "",
        "html": `<img src="${ loader }" width="100"/>`,
    };

class Masks {
    #globalLoadMask;

    get mask () {
        return maask;
    }

    get loadMask () {
        return loadMaask;
    }

    get globalLoadMask () {
        this.#globalLoadMask ??= new Ext.LoadMask( {
            ...loadMaask,
            "floated": true,
            "alwaysOnTop": true,
        } );

        return this.#globalLoadMask;
    }
}

export default new Masks();
