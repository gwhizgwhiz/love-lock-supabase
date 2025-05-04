// src/Loading.js
import React    from    'react';
import                  '../App.css'
import logo     from    '../assets/logo.png'


function Loading() {
    return (
        <div className="loading-container">
            <img src={logo} alt="Loading..." className="loading-logo" />

        </div>
    );
}

export default Loading;
