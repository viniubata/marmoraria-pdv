import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

const MaterialsPage = () => {
    const [materials, setMaterials] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const initialForm = {
        name: '',
        type: 'Granito',
        supplier: '',
        costPrice: 0,
        margin: 50, // Default 50%
        sellPrice: 0,
        thickness: '2cm',
        color: '',
        code: '',
        stock: 0,
        minStock: 10
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-calc sell price when cost or margin changes
    useEffect(() => {
        const cost = parseFloat(formData.costPrice) || 0;
        const margin = parseFloat(formData.margin) || 0;
        // Sell Price = Cost + (Cost * Margin / 100) -> Simple Markup
        // Or Margin based on Sell Price: Sell = Cost / (1 - Margin/100)
        // Let's use Simple Markup for simplicity unless specified otherwise, 
        // BUT the prompt asked for "Margem configurável" and "Margem bruta". 
        // Usually in Brazil trade: Price = Cost * (1 + Margin/100).
        // Let's stick to Price = Cost * (1 + Margin/100) for "Markup".

        // User asked for "Calculo automático de margem real".
        // Let's assume Markup for input.
        const sell = cost * (1 + margin / 100);

        // Only update if not manually editing sell price (optional complexity). 
        // For now, let's make it one-way binding for simplicity: Inputs drive result.
        setFormData(prev => ({ ...prev, sellPrice: sell.toFixed(2) }));
    }, [formData.costPrice, formData.margin]);

    const loadData = () => {
        setMaterials(db.getAll('materials'));
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editingItem) {
            db.update('materials', editingItem.id, formData);
        } else {
            db.add('materials', formData);
        }

        loadData();
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Excluir este material?')) {
            db.remove('materials', id);
            loadData();
        }
    };

    const filtered = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code?.includes(searchTerm)
    );

    return (
        <div>
            <PageHeader
                title="Materiais (Chapas)"
                description="Gestão de estoque e preços de chapas"
                actions={
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        + Nova Chapa
                    </button>
                }
            />

            {/* Search */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%' }}
                    />
                </div>
            </div>

            {/* List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'left' }}>Material</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'center' }}>Espessura</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>Estoque (m²)</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>Venda (m²)</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum material encontrado.</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div className="text-sm text-muted">Cód: {item.code || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{item.type}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.thickness}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <span style={{
                                            color: item.stock <= item.minStock ? 'var(--danger)' : 'inherit',
                                            fontWeight: item.stock <= item.minStock ? 'bold' : 'normal',
                                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem'
                                        }}>
                                            {item.stock <= item.minStock && <AlertTriangle size={14} />}
                                            {item.stock} m²
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        R$ {Number(item.sellPrice).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn-outline" style={{ padding: '0.5rem', marginRight: '0.5rem' }} onClick={() => handleOpenModal(item)}><Edit size={16} /></button>
                                        <button className="btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Material" : "Nova Chapa"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Nome do Material *</label>
                            <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Código</label>
                            <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Tipo</label>
                            <select className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Granito</option>
                                <option>Mármore</option>
                                <option>Quartzo</option>
                                <option>Dekton</option>
                                <option>Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted">Espessura</label>
                            <select className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.thickness} onChange={e => setFormData({ ...formData, thickness: e.target.value })}>
                                <option>2cm</option>
                                <option>3cm</option>
                                <option>1.5cm</option>
                                <option>4cm</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Custo (m²)</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Margem (%)</label>
                            <input type="number" step="0.1" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.margin} onChange={e => setFormData({ ...formData, margin: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Venda (m²)</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-main)' }} value={formData.sellPrice} readOnly />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Estoque Atual (m²)</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Estoque Mínimo</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MaterialsPage;
