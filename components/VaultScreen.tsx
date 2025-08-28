
import React, { useState, useContext, useMemo } from 'react';
import Header from './Header';
import PasswordCard from './PasswordCard';
import PasswordModal from './PasswordModal';
import { AppContext } from '../App';
import { type Account } from '../types';

const VaultScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!context) return null;
    const { accounts } = context;

    const filteredAccounts = useMemo(() => {
        if (!searchQuery) return accounts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return accounts.filter(
            (acc) =>
                acc.service.toLowerCase().includes(lowercasedQuery) ||
                acc.email.toLowerCase().includes(lowercasedQuery) ||
                (acc.username && acc.username.toLowerCase().includes(lowercasedQuery))
        );
    }, [accounts, searchQuery]);

    const handleAdd = () => {
        setEditingAccount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header onAdd={handleAdd} />
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search service, email or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                        />
                    </div>
                    {filteredAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAccounts.map((account) => (
                                <PasswordCard key={account.id} account={account} onEdit={handleEdit} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-xl text-gray-400">No accounts found.</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or add a new account.</p>
                        </div>
                    )}
                </div>
            </main>
            {isModalOpen && <PasswordModal account={editingAccount} onClose={handleCloseModal} />}
        </div>
    );
};

export default VaultScreen;
