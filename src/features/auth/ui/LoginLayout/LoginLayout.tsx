import React from 'react';
import './LoginLayout.css';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function LoginLayout({ left, right }: Props) {
  return (
    <div className="login-split">
      <div className="login-left">
        {left}
      </div>
      <div className="login-right">
        {right}
      </div>
    </div>
  );
}
