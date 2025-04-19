import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export default function VerifyEmail() {
  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Verify Your Email</h1>
        <p>
          A confirmation link has been sent to your inbox.<br/>
          Please click it to verify your account.<br/>
          Once verified, <Link to="/login">log in here</Link>.
        </p>
      </div>
    </div>
  );
}
