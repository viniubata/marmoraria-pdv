import React from 'react';

const PageHeader = ({ title, description, actions }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h1>
                {description && <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {actions}
            </div>
        </div>
    );
};

export default PageHeader;
