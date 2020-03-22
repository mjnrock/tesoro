import React from "react";

export default class App extends React.Component {
    processFile(dataURL, fileType) {
        let maxWidth = 800;
        let maxHeight = 800;
    
        let image = new Image();
        image.src = dataURL;
    
        image.onload = function () {    
            let canvas = document.getElementById('canvas');

            canvas.width = 200;
            canvas.height = 200;
    
            let context = canvas.getContext('2d');
    
            context.drawImage(this, 0, 0, canvas.width, canvas.height);
    
            dataURL = canvas.toDataURL(fileType);
        };
    
        image.onerror = function () {
            alert('There was an error processing your file!');
        };
    }

    readFile(file) {
        let reader = new FileReader();
    
        reader.onloadend = function () {
            this.processFile(reader.result, file.type);
        }.bind(this);
    
        reader.onerror = function () {
            alert('There was an error reading the file!');
        }
    
        reader.readAsDataURL(file);
    }

    handleChange(e) {
        let file = e.target.files[0];

        if(file) {
            if (/^image\//i.test(file.type)) {
                this.readFile(file);
            } else {
                alert('Not a valid image!');
            }
        }
    }

    render() {
        return (
            <div>
                <input type="file" accept="image/*" capture="camera" onChange={ this.handleChange.bind(this) } />
                <canvas id="canvas"></canvas>
            </div>
        )
    };
};