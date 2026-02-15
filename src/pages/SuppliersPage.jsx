import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { Search, Edit, Trash2, Truck } from 'lucide-react';

const SuppliersPage = () => {
    // Basic CRUD similar to others
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    useEffect(() => { setItems(db.getAll('suppliers')); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) db.update('suppliers', editingItem.id, formData);
        else db.add('suppliers', formData);
        setItems(db.getAll('suppliers'));
        setIsModalOpen(false);
    };

    return (
        <div>
            <PageHeader
                title="Fornecedores"
                actions={<button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({ name: '', phone: '', email: '' }); setIsModalOpen(true); }}>+ Novo Fornecedor</button>}
            />
            {/* Minimalist List */}
            <div className="card">
                {items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{i.name}</div>
                            <div className="text-sm text-muted">{i.phone}</div>
                        </div>
                        <button className="btn-outline" onClick={() => { setEditingItem(i); setFormData(i); setIsModalOpen(true); }}><Edit size={16} /></button>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Fornecedor">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input className="card" style={{ padding: '0.5rem' }} placeholder="Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <input className="card" style={{ padding: '0.5rem' }} placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <button className="btn btn-primary">Salvar</button>
                </form>
            </Modal>
        </div>
    );
};
export default SuppliersPage;
