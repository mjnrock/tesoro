import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

// const MTS = (new MTSLib.Main()).loadNetwork(false);
// MTS.Network.createWebSocket({ uri: `localhost:3000` });
const MTS = new MTSLib.Main({
    receive: (msg) => {
        document.getElementById("debug").innerHTML = JSON.stringify(MTSLib.Helper.CloneAsObject(msg.payload), null, 2);
    }
});
MTS.Router.addRoute(MTS, true);

const [ GEO_LOC ] = MTS.register(new MTSLib.Browser.GeoLocationNode({ name: "GeoLocation", receive: console.log }));
GEO_LOC.getPosition();

console.log(MTS);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);