import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

import MouseNode from "./MouseNode";
import KeyboardNode from "./KeyboardNode";
import Main from "./Main";
MTSLib.Browser.Input.MouseNode = MouseNode;
MTSLib.Browser.Input.KeyboardNode = KeyboardNode;
// MTSLib.Main = Main;

// const MTS = (new MTSLib.Main()).loadNetwork(false);
// MTS.Network.createWebSocket({ uri: `localhost:3000` });
const MTS = new MTSLib.Main({
    receive: (msg) => {
        document.getElementById("debug").innerHTML = JSON.stringify(MTSLib.Helper.CloneAsObject(msg), null, 2);
    }
});
// MTS.Router.addRoute(MTS, true);
MTS.Router.addRoute(MTS, [
    ...MTSLib.Browser.Input.MouseNode.AllSignalTypes(
        MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE,
        MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MASK,
    ),
    ...MTSLib.Browser.Input.KeyboardNode.AllSignalTypes()
]);

MTS.loadBrowserInput({ mouse: true, keys: true });

// const [ GEO_LOC ] = MTS.register(new MTSLib.Browser.GeoLocationNode({ name: "GeoLocation", receive: console.log }));
// GEO_LOC.getPosition();

console.log(MTS);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);