import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const FinancePage = () => {
    const [movements, setMovements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

    // Form
    const [formData, setFormData] = useState({
        description: '',
        value: 0,
        type: 'Receita', // Receita | Despesa
        date: new Date().toISOString().split('T')[0],
        category: 'Vendas'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = db.getAll('finance') || [];
        setMovements(data.reverse());

        const income = data.filter(m => m.type === 'Receita').reduce((acc, m) => acc + parseFloat(m.value), 0);
        const expense = data.filter(m => m.type === 'Despesa').reduce((acc, m) => acc + parseFloat(m.value), 0);
        setSummary({ income, expense, balance: income - expense });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        db.add('finance', formData);
        loadData();
        setIsModalOpen(false);
        setFormData({ description: '', value: 0, type: 'Despesa', date: new Date().toISOString().split('T')[0], category: '' });
    };

    return (
        <div>
            <PageHeader
                title="Financeiro"
                description="Controle de fluxo de caixa"
                actions={
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Novo Lançamento
                    </button>
                }
            />

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div className="text-sm text-secondary">Entradas</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={24} /> R$ {summary.income.toFixed(2)}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-secondary">Saídas</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingDown size={24} /> R$ {summary.expense.toFixed(2)}
                    </div>
                </div>
                <div className="card" style={{ border: '1px solid var(--primary)' }}>
                    <div className="text-sm text-secondary">Saldo Atual</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={24} /> R$ {summary.balance.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Data</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Descrição</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Categoria</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum lançamento.</td></tr>
                        ) : (
                            movements.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{m.description}</td>
                                    <td style={{ padding: '1rem' }}>{m.category}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: m.type === 'Receita' ? 'var(--success)' : 'var(--danger)' }}>
                                        {m.type === 'Receita' ? '+' : '-'} R$ {Number(m.value).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Tipo</label>
                            <select className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Receita</option>
                                <option>Despesa</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted">Valor</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} required />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted">Descrição</label>
                        <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Categoria</label>
                            <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Data</label>
                            <input type="date" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default FinancePage;
