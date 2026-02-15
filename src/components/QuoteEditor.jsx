import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from './PageHeader';
import { db } from '../services/db';
import { Plus, Trash2, Save, Printer, ArrowLeft } from 'lucide-react';

const QuoteEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [clients, setClients] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([]);

    // Quote State
    const [quote, setQuote] = useState({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Aberto',
        items: [],
        total: 0,
        discount: 0,
        finalTotal: 0
    });

    useEffect(() => {
        setClients(db.getAll('clients'));
        setMaterials(db.getAll('materials'));
        setProducts(db.getAll('products'));

        if (id && id !== 'new') {
            const existing = db.getById('quotes', id);
            if (existing) setQuote(existing);
        }
    }, [id]);

    useEffect(() => {
        calculateTotals();
    }, [quote.items, quote.discount]);

    const calculateTotals = () => {
        const subtotal = quote.items.reduce((acc, item) => acc + item.total, 0);
        const final = subtotal - (parseFloat(quote.discount) || 0);
        setQuote(prev => ({ ...prev, total: subtotal, finalTotal: final }));
    };

    const addItem = (type) => {
        const newItem = {
            id: crypto.randomUUID(),
            type, // 'material' | 'product'
            itemId: '',
            name: '',
            quantity: 1,
            width: 0,
            height: 0,
            area: 0,
            unitPrice: 0,
            total: 0
        };
        setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...quote.items];
        const item = { ...newItems[index], [field]: value };

        // Logic for Item Selection
        if (field === 'itemId') {
            if (item.type === 'material') {
                const mat = materials.find(m => m.id === value);
                if (mat) {
                    item.name = mat.name;
                    item.unitPrice = mat.sellPrice;
                }
            } else {
                const prod = products.find(p => p.id === value);
                if (prod) {
                    item.name = prod.name;
                    item.unitPrice = prod.price;
                }
            }
        }

        // Logic for Calculation
        if (item.type === 'material') {
            // Area = Width * Height * Qty
            // BUT usually width/height are in cm or m. Let's assume meters for input simplicity or convert?
            // User requested "Campo para medidas". Let's assume Meters.
            const w = parseFloat(item.width) || 0;
            const h = parseFloat(item.height) || 0;
            const qty = parseFloat(item.quantity) || 0;
            item.area = (w * h * qty).toFixed(2);
            item.total = item.area * item.unitPrice;
        } else {
            const qty = parseFloat(item.quantity) || 0;
            item.total = qty * item.unitPrice;
        }

        newItems[index] = item;
        setQuote(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index) => {
        const newItems = [...quote.items];
        newItems.splice(index, 1);
        setQuote(prev => ({ ...prev, items: newItems }));
    };

    const handleSave = () => {
        if (!quote.clientId) return alert('Selecione um cliente');

        let savedId = id;
        if (id && id !== 'new') {
            db.update('quotes', id, quote);
        } else {
            const newQuote = db.add('quotes', quote);
            savedId = newQuote.id;
        }
        return savedId;
    };

    const handleSaveAndExit = () => {
        handleSave();
        navigate('/quotes');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleConvertToOrder = () => {
        if (window.confirm('Aprovar orçamento e gerar Pedido/OS?')) {
            const savedId = handleSave(); // Ensure saved first

            // Update status
            db.update('quotes', savedId, { ...quote, status: 'Aprovado' });

            // Generate Order
            const client = db.getById('clients', quote.clientId);
            const order = {
                quoteId: savedId,
                clientId: quote.clientId,
                description: `Pedido ref. Orçamento #${savedId.slice(0, 8)}`,
                status: 'Produção', // Start in production
                items: quote.items,
                total: quote.finalTotal,
                date: new Date().toISOString().split('T')[0],
                deliveryDate: '' // To be set
            };
            db.add('orders', order);

            navigate('/orders');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/quotes')} className="btn-outline" style={{ border: 'none', padding: 0 }}><ArrowLeft /></button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{id === 'new' ? 'Novo Orçamento' : 'Editar Orçamento'}</h1>
                <div style={{ flex: 1 }}></div>

                {quote.status !== 'Aprovado' && (
                    <button className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }} onClick={handleConvertToOrder}>
                        <Printer size={18} /> Aprovar / Gerar OS
                    </button>
                )}

                <button className="btn btn-outline" onClick={handlePrint}><Printer size={18} /> Imprimir</button>
                <button className="btn btn-primary" onClick={handleSaveAndExit}><Save size={18} /> Salvar</button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label className="text-sm text-muted">Cliente</label>
                        <select
                            className="card"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
                            value={quote.clientId}
                            onChange={e => setQuote({ ...quote, clientId: e.target.value })}
                        >
                            <option value="">Selecione um cliente...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted">Data</label>
                        <input
                            type="date"
                            className="card"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
                            value={quote.date}
                            onChange={e => setQuote({ ...quote, date: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Item / Descrição</th>
                            <th style={{ padding: '1rem', width: '100px' }}>Medidas (m)</th>
                            <th style={{ padding: '1rem', width: '80px', textAlign: 'center' }}>Qtd</th>
                            <th style={{ padding: '1rem', width: '100px', textAlign: 'right' }}>Área (m²)</th>
                            <th style={{ padding: '1rem', width: '120px', textAlign: 'right' }}>Vl. Unit.</th>
                            <th style={{ padding: '1rem', width: '120px', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '1rem', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        className="card"
                                        style={{ width: '100%', padding: '0.5rem' }}
                                        value={item.itemId}
                                        onChange={e => updateItem(index, 'itemId', e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {item.type === 'material'
                                            ? materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                                            : products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                        }
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {item.type === 'material' && (
                                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                            <input type="number" step="0.01" placeholder="L" style={{ width: '45px', padding: '0.25rem' }} value={item.width} onChange={e => updateItem(index, 'width', e.target.value)} />
                                            <span>x</span>
                                            <input type="number" step="0.01" placeholder="A" style={{ width: '45px', padding: '0.25rem' }} value={item.height} onChange={e => updateItem(index, 'height', e.target.value)} />
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <input type="number" style={{ width: '100%', padding: '0.5rem', textAlign: 'center' }} value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {item.type === 'material' ? item.area : '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    R$ {item.unitPrice}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                                    R$ {item.total.toFixed(2)}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button className="btn-outline" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => removeItem(index)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" onClick={() => addItem('material')}>+ Adicionar Chapa (Material)</button>
                    <button className="btn-outline" onClick={() => addItem('product')}>+ Adicionar Produto/Serviço</button>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="text-secondary">Subtotal:</span>
                    <span style={{ fontSize: '1.25rem' }}>R$ {quote.total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="text-secondary">Desconto:</span>
                    <input
                        type="number"
                        step="0.01"
                        className="card"
                        style={{ padding: '0.5rem', width: '120px', textAlign: 'right' }}
                        value={quote.discount}
                        onChange={e => setQuote({ ...quote, discount: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Total Final:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>R$ {quote.finalTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default QuoteEditor;
