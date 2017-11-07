import React from 'react';
import { Link } from 'react-router-dom';
import './app.css';

const App = () => (
    <div>
        <Link to="/login/facebook" className="nav-link">Login with Facebook!</Link>
    </div>
);

export default App;
