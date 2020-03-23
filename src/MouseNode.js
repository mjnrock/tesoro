import MTSLib from "@lespantsfancy/message-transfer-system";

// import { Bitwise, GenerateUUID } from "./../../helper";
// import Node from "./../../Node";
// import Message from "./../../Message";

const { Bitwise } = MTSLib.Helper;
const { GenerateUUID } = MTSLib.Helper;
const Node = MTSLib.Node;
const Message = MTSLib.Message;

export default class MouseNode extends Node {
    static SignalTypes = {
        MOUSE_MASK: "MouseNode.MouseMask",
        MOUSE_MOVE: "MouseNode.MouseMove",
        MOUSE_CLICK: "MouseNode.MouseClick",
        MOUSE_DOUBLE_CLICK: "MouseNode.MouseDoubleClick",
        MOUSE_CONTEXT_MENU: "MouseNode.MouseContextMenu",
        MOUSE_UP: "MouseNode.MouseUp",
        MOUSE_DOWN: "MouseNode.MouseDown",
    };
    //* The primary use of this function is for <Router>
    static AllSignalTypes(...filter) {
        return Object.values(MouseNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, btnmap = null, btnflags = null, receive = null, parent = null, packager = null} = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });
        
        window.onmousedown = this.onMouseDown.bind(this);
        window.onmouseup = this.onMouseUp.bind(this);
        window.onmousemove = this.onMouseMove.bind(this);
        window.onclick = this.onClick.bind(this);
        window.ondblclick = this.onDblClick.bind(this);
        window.oncontextmenu = this.onContextMenu.bind(this);

        this.state = {
            Map: btnmap || {},
            Flags: btnflags || {},
            Mask: 0
        };

        //*  Default: Left/Right/Middle
        if(Object.keys(this.state.Map).length === 0 && Object.keys(this.state.Flags).length === 0) {
            this.registerButtons([
                [ "LEFT", [ 0 ], 2 << 0 ],
                [ "MIDDLE", [ 1 ], 2 << 1 ],
                [ "RIGHT", [ 2 ], 2 << 2 ],
            ]);
        }
        
        if(!window) {
            throw new Error("Window is not supported");
        }
    }

    updateMask(e) {
        Object.keys(this.state.Map).forEach(btnCode => {
            if(this.state.Map[ btnCode ].includes(e.button)) {
                if(e.type === "mouseup") {
                    this.state.Mask = Bitwise.remove(this.state.Mask, this.state.Flags[ btnCode ]);
                } else if(e.type === "mousedown") {
                    this.state.Mask = Bitwise.add(this.state.Mask, this.state.Flags[ btnCode ]);
                }
            }
        });

        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_MASK,
            this.state.Mask,
            this.signet
        ));

        return this;
    }

    getMousePosition(e) {
        return {
            x: e.x,
            y: e.y
        };
    }

    onMouseMove(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_MOVE,
            {
                mask: this.state.Mask,
                ...this.getMousePosition(e)
            },
            this.signet
        ));
    
        return this;
    }
    onMouseDown(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_DOWN,
            {
                button: e.button,
                mask: this.state.Mask,
                ...this.getMousePosition(e)
            },
            this.signet
        ));
    
        return this;
    }
    onMouseUp(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_UP,
            {
                button: e.button,
                mask: this.state.Mask,
                ...this.getMousePosition(e)
            },
            this.signet
        ));
    
        return this;
    }
    onClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_CLICK,
            {
                button: e.button,
                mask: this.state.Mask,
                ...this.getMousePosition(e)
            },
            this.signet
        ));
    
        return this;
    }
    onDblClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_DOUBLE_CLICK,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onContextMenu(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_CONTEXT_MENU,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }

    /**
     * Always use UPPER CASE for the @name to ensure proper function creation
     * @param {string} name 
     * @param {number[]} btnCodes 
     * @param {number} flag 
     */
    registerButton(name, btnCodes, flag) {
        this.state.Map[ name ] = Array.isArray(btnCodes) ? btnCodes : [ btnCodes ];
        this.state.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ] = () => Bitwise.has(this.state.Mask, this.state.Flags[ name ]);   //* Adds a function "hasCamelCasedButton() => true|false"

        return this;
    }
    /**
     * A helper function to allow for quicker registration of multiple buttons
     * @param {Array<[string, number[], number]} array 
     */
    registerButtons(array) {
        array.forEach(([ name, btnCodes, flag ]) => {
            this.registerButton(name, btnCodes, flag);
        });

        return this;
    }
    /**
     * Always use UPPER CASE for the @name to ensure proper function destruction
     * @param {string} name 
     */
    unregisterButton(name) {
        delete this.state.Map[ name ];
        delete this.state.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ];

        return this;
    }
}