import MTSLib from "@lespantsfancy/message-transfer-system";

// import MTS from "./package";
// import Repeater from "./Repeater";

const MTS = MTSLib;
const Repeater = MTSLib.Repeater;

export default class Main extends Repeater {
    constructor({ nodes = [], receive = null } = {}) {
        super({ receive });
        this._parent = this;

        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);

        this.Registry.register(this, ...nodes);
    }


    /**
     * On-demand module for network communication
     * @param {boolean} isMaster 
     */
    loadNetwork(isMaster = false) {
        this.Network = new MTS.Network.ConnectionBroker(this, { isMaster });

        return this;
    }
    /**
     * On-demand module in scopes where <Window> exists
     * @param {<Window>} window 
     */
    loadBrowserInput({ mouse = true, keys = true } = {}) {
        if(!window) {
            throw new Error("Window is not supported");
        }

        if(mouse) {
            let mouse = new MTS.Browser.Input.MouseNode(window);
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Mouse" ] = mouse;
            
            this.register(this.Browser.Input.Mouse);
        }

        if(keys) {
            let keys = new MTS.Browser.Input.KeyboardNode(window);
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Keys" ] = keys;
            
            this.register(this.Browser.Input.Keys);
        }

        return this;
    }

    
    //? Elevated registry functions
    get get() {
        return this.Registry.get.bind(this.Registry);
    }
    get register() {
        return this.Registry.register.bind(this.Registry);
    }
    get unregister() {
        return this.Registry.unregister.bind(this.Registry);
    }
}