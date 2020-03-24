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
        MOUSE_SELECTION: "MouseNode.MouseSelection",
        MOUSE_PATH: "MouseNode.MousePath",
    };
    
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
            Mask: 0,
            Selection: {},
            Path: {},
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

    _startPath(button, x, y, timeout = 2000) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            button: button,
            points: [
                [ x, y ]
            ],
            timeout: setTimeout(() => this._firePath(button), timeout)
        };
        
        this.state.Path[ button ] = obj;

        return obj;
    }
    _addPath(button, x, y, timeout = 2000) {
        this.state.Path[ button ].points.push([ x, y ]);
        
        clearTimeout(this.state.Path[ button ].timeout);
        this.state.Path[ button ].timeout = setTimeout(() => this._firePath(button), timeout);
    }
    _firePath(button) {
        let path = this.state.Path[ button ];

        if(path) {
            this.send(
                MouseNode.SignalTypes.MOUSE_PATH,
                {
                    button: path.button,
                    mask: this.state.Mask,
                    points: path.points
                }
            );

            clearTimeout(path.timeout);

            delete this.state.Path[ button ];
        }
    }

    _startSelection(button, x, y, timeout = 5000, threshold = 20) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            button: button,
            points: {
                start: [ x, y ],
                end: []
            },
            threshold: threshold,
            timeout: setTimeout(() => this._fireSelection(button), timeout)
        };
        
        this.state.Selection[ button ] = obj;
    }
    _fireSelection(button) {
        let selection = this.state.Selection[ button ];

        if(selection) {
            if(selection.points.end.length) {
                let size = {
                    width: selection.points.end[ 0 ] - selection.points.start[ 0 ],
                    height: selection.points.end[ 1 ] - selection.points.start[ 1 ],
                    threshold: selection.threshold
                }

                if(Math.abs(size.width) >= selection.threshold && Math.abs(size.height) >= selection.threshold) {
                    this.send(
                        MouseNode.SignalTypes.MOUSE_SELECTION,
                        {
                            button: selection.button,
                            mask: this.state.Mask,
                            start: selection.points.start,
                            end: selection.points.end,
                            size: size,
                        }
                    );
                }
            }

            clearTimeout(selection.timeout);

            delete this.state.Selection[ button ];
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
        
        let pos = this.getMousePosition(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_MOVE,
            {
                mask: this.state.Mask,
                ...pos
            },
            this.signet
        ));

        for(let path of Object.values(this.state.Path)) {
            this._addPath(
                path.button,
                pos.x,
                pos.y
            );
        }
    
        return this;
    }
    onMouseDown(e) {
        e.preventDefault();

        this.updateMask(e);

        let pos = this.getMousePosition(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_DOWN,
            {
                button: e.button,
                mask: this.state.Mask,
                ...pos
            },
            this.signet
        ));

        if(!this.state.Selection[ e.button ]) {
            this._startSelection(
                e.button,
                pos.x,
                pos.y
            );
        }
        if(!this.state.Path[ e.button ]) {
            this._startPath(
                e.button,
                pos.x,
                pos.y
            );
        }
    
        return this;
    }
    onMouseUp(e) {
        e.preventDefault();

        this.updateMask(e);
        
        let pos = this.getMousePosition(e);
        this.message(new Message(
            MouseNode.SignalTypes.MOUSE_UP,
            {
                button: e.button,
                mask: this.state.Mask,
                ...pos
            },
            this.signet
        ));

        if(this.state.Selection[ e.button ]) {
            this.state.Selection[ e.button ].points.end = [ pos.x, pos.y ];
            this._fireSelection(
                e.button
            );
        }
        if(this.state.Path[ e.button ]) {
            this._firePath(
                e.button
            );
        }
    
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