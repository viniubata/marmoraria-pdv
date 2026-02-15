import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { Search, Edit, Trash2, Package, Wrench } from 'lucide-react';

const ProductsPage = () => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('Produto'); // Produto | Insumo

    // Form State
    const initialForm = {
        name: '',
        type: 'Produto', // Produto | Insumo
        category: '',
        price: 0, // Sell Price for Product, Cost for Supply
        unit: 'un',
        stock: 0,
        minStock: 5
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // We store both in 'products' collection but differentiate by type
        setItems(db.getAll('products'));
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ ...initialForm, type: activeTab });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editingItem) {
            db.update('products', editingItem.id, formData);
        } else {
            db.add('products', formData);
        }

        loadData();
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Excluir este item?')) {
            db.remove('products', id);
            loadData();
        }
    };

    const filtered = items.filter(i =>
        i.type === activeTab &&
        (i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <PageHeader
                title="Produtos e Insumos"
                description="Gestão de serviços padrão e materiais de consumo"
                actions={
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        + Novo {activeTab}
                    </button>
                }
            />

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('Produto')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'Produto' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'Produto' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 500
                    }}
                >
                    Produtos / Serviços
                </button>
                <button
                    onClick={() => setActiveTab('Insumo')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'Insumo' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'Insumo' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 500
                    }}
                >
                    Insumos de Produção
                </button>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={`Buscar ${activeTab.toLowerCase()}...`}
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
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'left' }}>Categoria</th>
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>
                                {activeTab === 'Produto' ? 'Preço Base' : 'Custo Unit.'}
                            </th>
                            {activeTab === 'Insumo' && (
                                <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>Estoque</th>
                            )}
                            <th className="text-sm text-secondary" style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum item encontrado.</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '1rem' }}>{item.category || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        R$ {Number(item.price).toFixed(2)} / {item.unit}
                                    </td>
                                    {activeTab === 'Insumo' && (
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{item.stock} {item.unit}</td>
                                    )}
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
                title={editingItem ? `Editar ${activeTab}` : `Novo ${activeTab}`}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-sm text-muted">Nome do Item *</label>
                        <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">Categoria</label>
                            <input type="text" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Unidade</label>
                            <select className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="un">Unidade (un)</option>
                                <option value="m2">Metro Quad. (m²)</option>
                                <option value="ml">Metro Linear (ml)</option>
                                <option value="kg">Quilo (kg)</option>
                                <option value="l">Litro (l)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted">{activeTab === 'Produto' ? 'Preço Base' : 'Custo Unitário'}</label>
                            <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        {activeTab === 'Insumo' && (
                            <div>
                                <label className="text-sm text-muted">Estoque Atual</label>
                                <input type="number" step="0.01" className="card" style={{ width: '100%', padding: '0.5rem' }} value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>
                        )}
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

export default ProductsPage;
