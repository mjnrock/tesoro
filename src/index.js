import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

import MouseNode from "./MouseNode";
import KeyboardNode from "./KeyboardNode";
MTSLib.Browser.Input.MouseNode = MouseNode;
MTSLib.Browser.Input.KeyboardNode = KeyboardNode;

const MTS = (new MTSLib.Main({
    receive: (msg) => {
        document.getElementById("debug").innerHTML = JSON.stringify(MTSLib.Helper.CloneAsObject(msg), null, 2);
    },
    routes: [
        ...MTSLib.Browser.Input.MouseNode.AllSignalTypes(
            MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE,
            MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MASK,
        ),
        ...MTSLib.Browser.Input.KeyboardNode.AllSignalTypes()
    ]
})).loadNetwork(false, { routes: [ 
    MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_CLICK,
]}).loadBrowserInput({ mouse: true, keys: true });

MTS.Network.createWebSocket({ uri: `localhost:3000` });

// const [ GEO_LOC ] = MTS.register(new MTSLib.Browser.GeoLocationNode({ name: "GeoLocation", receive: console.log }));
// GEO_LOC.getPosition();

console.log(MTS);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);