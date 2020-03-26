import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

const MTS = (new MTSLib.Main({
        // Overwrite the #debug element with that last Message received
        receive: (msg) => {
            console.log(msg);
            document.getElementById("debug").innerHTML = JSON.stringify(MTSLib.Helper.CloneAsObject(msg), null, 2);
        },
        // A list of routes for the Main Node to respond to
        routes: false,
        // routes: [
        //     // MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_SELECTION,
        //     // MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_PATH,
        //     ...MTSLib.Browser.Input.MouseNode.AllSignalTypes(
        //         MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE,
        //         MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MASK,
        //     ),
        //     ...MTSLib.Browser.Input.KeyboardNode.AllSignalTypes(),
        //     ...MTSLib.Network.WebSocketNode.AllSignalTypes()
        // ]
    }))
    // Activate the ConnectionBroker, establish as a Slave, and respond to a subset list of Message.types
    .loadNetwork(false, {
        routes: [ 
            MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_CLICK,
        ]
    })
    // Activate the MTS.Browser.Input Nodes
    .loadBrowserInput({
        mouse: true,
        keys: false
    });

let X = null, Y = null;
const Canvas = new MTSLib.Browser.CanvasNode({
    name: "Canvas",
    receive: function(msg) {
        let { mask, x: ax, y: ay } = msg.payload,
            { x, y } = this.relPos(ax, ay);

        
        if(mask === 2) {
            this.prop({
                strokeStyle: "#000"
            });
        } else if(mask === 8) {
            this.prop({
                strokeStyle: "#f00"
            });
        }

        if(mask === 2 || mask === 8) {
            if(msg.type === MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_DOWN) {
                X = x;
                Y = y;
            } else if(msg.type === MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE) {
                this.line(X, Y, x, y);
    
                X = x;
                Y = y;
            } else if(msg.type === MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_UP) {
                X = null;
                Y = null;
            }
        }
    }
});
MTS.register(Canvas);
MTS.Router.addRoute(Canvas, [ 
    MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_UP,
    MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_DOWN,
    MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE,
]);
Canvas.createCanvas({ width: 500, height: 500 });
Canvas.toggleSmoothLines();
Canvas.canvas.style = "border: 1px solid #000; border-radius: 4px;";

// Canvas.ctx.strokeStyle = "#000";
// Canvas.ctx.fillStyle = "#000";
// Canvas.ctx.fillRect(20, 20, 50, 50);

// Establish a websocket connection
MTS.Network.webSocketNode({ uri: `localhost:3000` });

// const [ GEO_LOC ] = MTS.register(new MTSLib.Browser.GeoLocationNode({ name: "GeoLocation", receive: console.log }));
// GEO_LOC.getPosition();

console.log(MTS);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);