import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { db } from '../services/db';
import { Search, Edit, FileText, Plus } from 'lucide-react';

const QuotesPage = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = () => {
        const data = db.getAll('quotes');
        // Join with clients to show names
        const enriched = data.map(q => {
            const client = db.getById('clients', q.clientId);
            return { ...q, clientName: client ? client.name : 'Desconhecido' };
        });
        setQuotes(enriched.reverse()); // Show newest first
    };

    const filtered = quotes.filter(q =>
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.includes(searchTerm)
    );

    return (
        <div>
            <PageHeader
                title="Orçamentos"
                description="Gestão de propostas comerciais"
                actions={
                    <button className="btn btn-primary" onClick={() => navigate('/quotes/new')}>
                        <Plus size={18} /> Novo Orçamento
                    </button>
                }
            />

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', width: '120px' }}>Data</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Cliente</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum orçamento encontrado.</td></tr>
                        ) : (
                            filtered.map(q => (
                                <tr key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {new Date(q.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{q.clientName}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: q.status === 'Aprovado' ? '#dcfce7' : '#f1f5f9',
                                            color: q.status === 'Aprovado' ? '#166534' : '#64748b'
                                        }}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                                        R$ {Number(q.finalTotal).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn-outline" onClick={() => navigate(`/quotes/${q.id}`)}>
                                            <Edit size={16} /> Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotesPage;
