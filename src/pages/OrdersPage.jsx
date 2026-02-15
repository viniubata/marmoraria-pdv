import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { db } from '../services/db';
import { Kanban, CheckCircle, Clock, Truck, Hammer } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = db.getAll('orders');
        // enrich with client name
        const enriched = data.map(o => ({
            ...o,
            clientName: db.getById('clients', o.clientId)?.name || 'N/A'
        }));
        setOrders(enriched);
    };

    const updateStatus = (orderId, newStatus) => {
        db.update('orders', orderId, { status: newStatus });
        loadData();
    };

    const columns = [
        { id: 'Produção', label: 'Em Produção', icon: Hammer, color: 'var(--primary)', bg: '#eff6ff' },
        { id: 'Polimento', label: 'Polimento', icon: Kanban, color: '#eab308', bg: '#fefce8' },
        { id: 'Instalação', label: 'Instalação', icon: Truck, color: '#8b5cf6', bg: '#f5f3ff' },
        { id: 'Finalizado', label: 'Finalizado', icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' }
    ];

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <PageHeader title="Pedidos / OS" description="Acompanhamento de Produção" />

            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', flex: 1, paddingBottom: '1rem' }}>
                {columns.map(col => (
                    <div key={col.id} style={{
                        flex: '0 0 300px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: col.bg,
                            borderTopLeftRadius: 'var(--radius-lg)',
                            borderTopRightRadius: 'var(--radius-lg)',
                            fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: col.color
                        }}>
                            <col.icon size={18} /> {col.label}
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'white', padding: '2px 6px', borderRadius: '10px' }}>
                                {orders.filter(o => o.status === col.id).length}
                            </span>
                        </div>

                        <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto' }}>
                            {orders.filter(o => o.status === col.id).map(order => (
                                <div key={order.id} className="card" style={{ marginBottom: '0.5rem', padding: '0.75rem', cursor: 'grab' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>#{order.id.slice(0, 8)}</div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.clientName}</div>
                                    <div style={{ fontSize: '0.875rem' }}>{order.description || 'Pedido s/ descrição'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Entrega: {order.deliveryDate || 'N/A'}
                                    </div>

                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.25rem' }}>
                                        {col.id !== 'Produção' && (
                                            <button onClick={() => updateStatus(order.id, columns[columns.findIndex(c => c.id === col.id) - 1].id)} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>&larr; Voltar</button>
                                        )}
                                        {col.id !== 'Finalizado' && (
                                            <button onClick={() => updateStatus(order.id, columns[columns.findIndex(c => c.id === col.id) + 1].id)} style={{ fontSize: '0.75rem', padding: '2px 6px', marginLeft: 'auto' }}>Avançar &rarr;</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default OrdersPage;
