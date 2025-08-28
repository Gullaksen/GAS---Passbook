
import React, { useState, useContext, useEffect } from 'react';
import { type Account } from '../types';
import { AppContext } from '../App';
import { generatePassword } from '../services/cryptoService';
import { RefreshIcon } from './icons/RefreshIcon';


interface PasswordModalProps {
    account: Account | null;
    onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ account, onClose }) => {
    const context = useContext(AppContext);
    const [formData, setFormData] = useState({
        service: '',
        email: '',
        username: '',
        password: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (account) {
            setFormData({
                service: account.service,
                email: account.email,
                username: account.username || '',
                password: account.password_decrypted || '',
            });
        }
    }, [account]);

    if (!context) return null;
    const { accounts, setAccounts, showToast } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword(16, true);
        setFormData(prev => ({ ...prev, password: newPassword }));
        showToast('New password generated.');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.service || !formData.email || !formData.password) {
            showToast('Service, Email, and Password are required.');
            return;
        }
        setIsSaving(true);
        
        try {
            if (account) { // Editing existing account
                const updatedAccounts = accounts.map(acc => 
                    acc.id === account.id 
                    ? { ...acc, ...formData, password_decrypted: formData.password, updatedAt: new Date().toISOString() } 
                    : acc
                );
                await setAccounts(updatedAccounts);
                showToast('Account updated successfully.');
            } else { // Adding new account
                const newAccount: Account = {
                    id: crypto.randomUUID(),
                    ...formData,
                    password_decrypted: formData.password,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await setAccounts([...accounts, newAccount]);
                showToast('Account added successfully.');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save account:', error);
            showToast('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{account ? 'Edit Account' : 'Add Account'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="service" value={formData.service} onChange={handleChange} placeholder="Service (e.g., Google)" className="w-full bg-gray-700 p-2 rounded text-white" required/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-gray-700 p-2 rounded text-white" required/>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username (optional)" className="w-full bg-gray-700 p-2 rounded text-white" />
                    <div className="relative">
                        <input type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-gray-700 p-2 rounded text-white pr-10" required />
                        <button type="button" onClick={handleGeneratePassword} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-400" aria-label="Generate new password">
                           <RefreshIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500">
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
