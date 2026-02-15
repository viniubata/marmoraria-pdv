import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Layers,
    Package,
    ShoppingCart,
    FileText,
    Briefcase,
    DollarSign,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: Layers, label: 'Materiais (Chapas)', path: '/materials' },
        { icon: Package, label: 'Produtos e Insumos', path: '/products' },
        { icon: FileText, label: 'Orçamentos', path: '/quotes' },
        { icon: Briefcase, label: 'Pedidos / OS', path: '/orders' },
        { icon: DollarSign, label: 'Financeiro', path: '/finance' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    return (
        <aside style={{
            width: '250px',
            height: '100vh',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text-sidebar)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Marmoraria PDV</h1>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Sistema de Gestão</p>
            </div>

            <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem 1.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            transition: 'all 0.2s'
                        })}
                    >
                        <item.icon size={20} style={{ marginRight: '0.75rem' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        A
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem' }}>Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
