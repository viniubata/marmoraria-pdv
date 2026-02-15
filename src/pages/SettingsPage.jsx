import React from 'react';
import PageHeader from '../components/PageHeader';

const SettingsPage = () => {
    return (
        <div>
            <PageHeader
                title="Configurações"
                description="Ajustes do sistema"
            />
            <div className="card">
                <p className="text-muted">Parâmetros de cálculo, usuários, etc.</p>
            </div>
        </div>
    );
};
export default SettingsPage;
