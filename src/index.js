import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

window.addEventListener("load",function() {
    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});

ReactDOM.render(
    <App />,
    document.getElementById("root")
);