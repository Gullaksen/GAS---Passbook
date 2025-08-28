
import React, { useContext, useRef } from 'react';
import { AppContext } from '../App';
import { getVault, storeVault } from '../services/storageService';
import { PlusIcon } from './icons/PlusIcon';
import { LockIcon } from './icons/LockIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface HeaderProps {
    onAdd: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdd }) => {
    const context = useContext(AppContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const vault = getVault();
        if (vault) {
            const vaultString = JSON.stringify(vault, null, 2);
            const blob = new Blob([vaultString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `passbook_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            context?.showToast('Vault exported successfully.');
        } else {
            context?.showToast('No vault found to export.');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const importedVault = JSON.parse(text);
                        if (importedVault.meta && importedVault.data) {
                            storeVault(importedVault);
                            context?.showToast('Import successful! Please unlock with the new vault\'s passphrase.');
                            context?.lockVault();
                        } else {
                            throw new Error('Invalid vault file format.');
                        }
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    context?.showToast('Import failed. Invalid file or format.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-2xl font-bold text-white">My Passbook</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={onAdd} className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Add new account">
                           <PlusIcon className="h-5 w-5" />
                        </button>
                        <button onClick={handleExport} className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Export vault">
                            <DownloadIcon className="h-5 w-5" />
                        </button>
                        <button onClick={handleImportClick} className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Import vault">
                            <UploadIcon className="h-5 w-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={context?.lockVault} className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Lock vault">
                            <LockIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
