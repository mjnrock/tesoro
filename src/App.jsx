import React from "react";

let id = null;

export default class App extends React.Component {    
    geoFindMe() {
        const status = document.querySelector('#status');

        function success(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log(position.coords);
            status.textContent = `${ latitude }, ${ longitude } | ${ position.coords.accuracy } | ${ position.coords.heading }`;
            navigator.geolocation.clearWatch(id);
            
            // navigator.geolocation.getCurrentPosition(success, error);
            id = navigator.geolocation.watchPosition(success, error, {
                enableHighAccuracy: true,
                timeout: 5000,
            });
        }

        function error(e) {
            console.log(e);
            status.textContent = e.message;
        }

        if (!navigator.geolocation) {
            status.textContent = 'Geolocation is not supported by your browser';
        } else {
            status.textContent = 'Locating…';
            // navigator.geolocation.getCurrentPosition(success, error);
            id = navigator.geolocation.watchPosition(success, error, {
                enableHighAccuracy: true,
                timeout: 5000,
            });
        }

    }

    render() {
        return (
            <div>
                <button id="find-me" onClick={ this.geoFindMe.bind(this) }>Show my location</button>
                <br />
                <p id="status"></p>
            </div>
        )
    };
};