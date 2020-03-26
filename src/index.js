import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

const MTS = (new MTSLib.Main({
        // Overwrite the #debug element with that last Message received
        receive: (msg) => {
            console.info(msg);
            document.getElementById("debug").innerHTML = JSON.stringify(MTSLib.Helper.CloneAsObject(msg), null, 2);
        },
        routes: [
            MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_CLICK,
            ...MTSLib.Browser.CanvasNode.AllSignalTypes(),
            ...MTSLib.Network.WebSocketNode.AllSignalTypes()
        ]
    }))
    // Activate the ConnectionBroker, establish as a Slave, and respond to a subset list of Message.types
    .loadNetwork(false)
    // Activate the MTS.Browser.Input Nodes
    .loadBrowserInput({
        mouse: true,
        keys: false
    });

const Canvas = new MTSLib.Browser.CanvasNode({
    name: "Canvas",
    receive: function(msg) {
        if(msg.type === MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_CLICK) {
            let { x: ax, y: ay } = msg.payload,
                { x, y } = this.relPos(ax, ay);        

            this.message((new MTSLib.Message(
                MTSLib.Browser.CanvasNode.SignalTypes.DRAW_CIRCLE,
                {
                    x,
                    y,
                    radius: 25
                }
            )).elevate());
        } else if(msg.type === MTSLib.Browser.CanvasNode.SignalTypes.DRAW_CIRCLE) {
            let { x, y } = msg.payload;
            
            this.circle(x, y, 25, { isFilled: true });
        }
    }
});
MTS.register(Canvas);
MTS.Router.addRoute(Canvas, [ 
    MTSLib.Browser.CanvasNode.SignalTypes.DRAW_CIRCLE,
    MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_CLICK
]);
Canvas.setCanvas(document.getElementById("canvas"));
Canvas.resize(500, 500);
Canvas.toggleSmoothLines();
Canvas.canvas.style = "border: 1px solid #000; border-radius: 4px;";

console.warn(`Canvas: ${ Canvas.id }`);

// Establish a websocket connection
MTS.Network.webSocketNode({ uri: `localhost:3000` });
console.warn(`WS: ${ MTS.Network.getWebSocketNode().id }`);

console.log(MTS);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);