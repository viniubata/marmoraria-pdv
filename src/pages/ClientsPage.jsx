import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { Search, Edit, Trash2, Phone, Mail } from 'lucide-react';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        document: '', // CPF/CNPJ
        phone: '',
        email: '',
        address: '',
        type: 'Final' // Final, Construtora, Arquiteto
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = () => {
        setClients(db.getAll('clients'));
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData(client);
        } else {
            setEditingClient(null);
            setFormData({
                name: '',
                document: '',
                phone: '',
                email: '',
                address: '',
                type: 'Final'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editingClient) {
            db.update('clients', editingClient.id, formData);
        } else {
            db.add('clients', formData);
        }

        loadClients();
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            db.remove('clients', id);
            loadClients();
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document?.includes(searchTerm)
    );

    return (
        <div>
            <PageHeader
                title="Clientes"
                description="Gerencie sua base de clientes"
                actions={
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        + Novo Cliente
                    </button>
                }
            />

            {/* Search Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            width: '100%',
                            color: 'var(--text-main)'
                        }}
                    />
                </div>
            </div>

            {/* Clients List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Contato</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Nenhum cliente encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map(client => (
                                <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{client.name}</div>
                                        <div className="text-sm text-muted">{client.document}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: client.type === 'Final' ? '#eff6ff' : '#f0fdf4',
                                            color: client.type === 'Final' ? '#1d4ed8' : '#15803d'
                                        }}>
                                            {client.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <Phone size={14} className="text-muted" /> {client.phone}
                                        </div>
                                        {client.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <Mail size={14} className="text-muted" /> {client.email}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            className="btn-outline"
                                            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
                                            onClick={() => handleOpenModal(client)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn-outline"
                                            style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClient ? "Editar Cliente" : "Novo Cliente"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Nome Completo *</label>
                        <input
                            type="text"
                            className="card"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>CPF / CNPJ</label>
                            <input
                                type="text"
                                className="card"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                value={formData.document}
                                onChange={e => setFormData({ ...formData, document: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Tipo de Cliente</label>
                            <select
                                className="card"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Final">Consumidor Final</option>
                                <option value="Construtora">Construtora</option>
                                <option value="Arquiteto">Arquiteto/Parceiro</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Telefone / WhatsApp</label>
                            <input
                                type="text"
                                className="card"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>E-mail</label>
                            <input
                                type="email"
                                className="card"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Endereço Completo</label>
                        <textarea
                            className="card"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', minHeight: '80px' }}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ClientsPage;
