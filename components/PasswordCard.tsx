
import React, { useState, useContext, useEffect } from 'react';
import { type Account } from '../types';
import { AppContext } from '../App';
import { CopyIcon } from './icons/CopyIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface PasswordCardProps {
    account: Account;
    onEdit: (account: Account) => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({ account, onEdit }) => {
    const context = useContext(AppContext);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isPasswordVisible) {
            const timer = setTimeout(() => setIsPasswordVisible(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [isPasswordVisible]);

    if (!context) return null;
    const { showToast, accounts, setAccounts } = context;

    const handleCopy = (value: string, fieldName: string) => {
        navigator.clipboard.writeText(value);
        showToast(`Copied ${fieldName} to clipboard`);
    };

    const handleDelete = () => {
        const updatedAccounts = accounts.filter(acc => acc.id !== account.id);
        setAccounts(updatedAccounts);
        showToast(`'${account.service}' deleted.`);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col justify-between transition-transform transform hover:scale-105">
            <div>
                <h3 className="text-xl font-bold text-white truncate">{account.service}</h3>
                <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 truncate pr-2">{account.email}</span>
                        <button onClick={() => handleCopy(account.email, 'Email')} className="text-gray-400 hover:text-blue-400" aria-label="Copy email">
                            <CopyIcon className="h-5 w-5" />
                        </button>
                    </div>
                    {account.username && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 truncate pr-2">{account.username}</span>
                            <button onClick={() => handleCopy(account.username!, 'Username')} className="text-gray-400 hover:text-blue-400" aria-label="Copy username">
                                <CopyIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-mono tracking-wider">{isPasswordVisible ? account.password_decrypted || '...decrypted...' : '••••••••'}</span>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="text-gray-400 hover:text-blue-400" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                                {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                            <button onClick={() => handleCopy(account.password_decrypted!, 'Password')} className="text-gray-400 hover:text-blue-400" aria-label="Copy password">
                                <CopyIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
                {showDeleteConfirm ? (
                    <div className="flex w-full justify-between items-center">
                        <span className="text-sm text-yellow-400">Are you sure?</span>
                        <div>
                            <button onClick={handleDelete} className="text-sm font-bold text-red-500 hover:text-red-400 px-2 py-1">Yes</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="text-sm text-gray-300 hover:text-white px-2 py-1">No</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3">
                         <button onClick={() => onEdit(account)} className="text-gray-400 hover:text-green-400" aria-label="Edit account">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                         <button onClick={() => setShowDeleteConfirm(true)} className="text-gray-400 hover:text-red-400" aria-label="Delete account">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordCard;
