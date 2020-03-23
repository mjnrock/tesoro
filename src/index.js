import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "@lespantsfancy/message-transfer-system";

const MTS = (new MTSLib.Main()).loadNetwork(false);
MTS.Network.createWebSocket({ uri: `localhost:3000` });

ReactDOM.render(
    <App />,
    document.getElementById("root")
);