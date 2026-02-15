import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar />
            <main style={{
                marginLeft: '250px',
                flex: 1,
                padding: '2rem',
                overflowY: 'auto'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
