
const DB_KEY = 'marmoraria_pdv_db_v1';

const initialData = {
    clients: [],
    materials: [],
    products: [],
    supplies: [],
    suppliers: [],
    quotes: [],
    orders: [],
    financial_movements: [],
    settings: {
        nextQuoteId: 1,
        nextOrderId: 1,
        nextClientId: 1,
    }
};

class DBService {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        }
    }

    _read() {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : initialData;
    }

    _write(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // Generic Get
    getAll(collection) {
        const db = this._read();
        return db[collection] || [];
    }

    getById(collection, id) {
        const list = this.getAll(collection);
        return list.find(item => item.id === id);
    }

    // Generic Add
    add(collection, item) {
        const db = this._read();
        if (!db[collection]) db[collection] = [];

        const newItem = {
            ...item,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db[collection].push(newItem);
        this._write(db);
        return newItem;
    }

    // Generic Update
    update(collection, id, updates) {
        const db = this._read();
        const index = db[collection].findIndex(item => item.id === id);
        if (index === -1) return null;

        db[collection][index] = {
            ...db[collection][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this._write(db);
        return db[collection][index];
    }

    // Generic Delete
    remove(collection, id) {
        const db = this._read();
        const filtered = db[collection].filter(item => item.id !== id);
        db[collection] = filtered;
        this._write(db);
        return true;
    }

    // Specific Logic for ID counters if needed, 
    // but randomUUID is usually better for distributed/local systems to avoid collisions.
}

export const db = new DBService();
