import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { db } from '../services/db';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
    const [kpis, setKpis] = useState({
        revenue: 0,
        activeOrders: 0,
        lowStockItems: 0,
        avgTicket: 0
    });

    useEffect(() => {
        const orders = db.getAll('orders');
        const materials = db.getAll('materials');
        const finance = db.getAll('finance'); // Or use orders total for revenue

        const revenue = orders.reduce((acc, o) => acc + parseFloat(o.total), 0);
        const activeOrders = orders.filter(o => o.status !== 'Finalizado').length;
        const lowStock = materials.filter(m => parseFloat(m.stock) <= parseFloat(m.minStock)).length;
        const avgTicket = orders.length ? revenue / orders.length : 0;

        setKpis({ revenue, activeOrders, lowStock, avgTicket });
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <div className="text-sm text-secondary">{title}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0' }}>{value}</div>
                {subtext && <div className="text-sm text-muted">{subtext}</div>}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: color + '20', color: color }}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader title="Dashboard Executivo" description="Visão geral do negócio" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Faturamento Total"
                    value={`R$ ${kpis.revenue.toFixed(0)}`}
                    icon={DollarSign}
                    color="var(--primary)"
                    subtext="Baseado em pedidos gerados"
                />
                <StatCard
                    title="Pedidos em Produção"
                    value={kpis.activeOrders}
                    icon={ShoppingCart}
                    color="var(--warning)"
                />
                <StatCard
                    title="Ticket Médio"
                    value={`R$ ${kpis.avgTicket.toFixed(0)}`}
                    icon={TrendingUp}
                    color="var(--success)"
                />
                <StatCard
                    title="Estoque Baixo"
                    value={kpis.lowStockItems}
                    icon={Package}
                    color="var(--danger)"
                    subtext="Chapas abaixo do mínimo"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ minHeight: '300px' }}>
                    <h3>Vendas Recentes</h3>
                    <div style={{ marginTop: '1rem', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        Gráfico de Vendas (Simulação)
                        {/* Placeholder for chart */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px' }}>
                            {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                <div key={i} style={{ width: '30px', height: `${h}%`, backgroundColor: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Atalhos Rápidos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>+ Novo Orçamento</button>
                        <button className="btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>+ Cadastrar Cliente</button>
                        <button className="btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>+ Lançar Despesa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;
