
import React, { useState, useCallback, useEffect } from 'react';
import LockedScreen from './components/LockedScreen';
import VaultScreen from './components/VaultScreen';
import { Toast } from './components/Toast';
import { type Account, type EncryptedVault } from './types';
import { deriveKey, decryptData, encryptData } from './services/cryptoService';
import { getVault, storeVault } from './services/storageService';
import { useAutoLock } from './hooks/useAutoLock';

export const AppContext = React.createContext<{
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
    derivedKey: CryptoKey | null;
    showToast: (message: string) => void;
    lockVault: () => void;
} | null>(null);


const App: React.FC = () => {
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [toastMessage, setToastMessage] = useState<string>('');

    const lockVault = useCallback(() => {
        setIsLocked(true);
        setDerivedKey(null);
        setAccounts([]);
    }, []);

    useAutoLock(lockVault, isLocked);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleUnlock = async (key: CryptoKey) => {
        try {
            const vault: EncryptedVault | null = getVault();
            if (vault) {
                const decryptedAccounts = await decryptData(vault.data, key, vault.meta.salt);
                setAccounts(JSON.parse(decryptedAccounts));
                setDerivedKey(key);
                setIsLocked(false);
                showToast('Vault unlocked!');
            }
        } catch (error) {
            console.error('Decryption failed:', error);
            showToast('Invalid passphrase.');
            throw new Error('Decryption failed');
        }
    };

    const updateAndSaveAccounts = async (newAccounts: Account[]) => {
        if (!derivedKey) {
            showToast('Error: Vault key is not available.');
            lockVault();
            return;
        }
        setAccounts(newAccounts);
        try {
            const vault = getVault();
            if (!vault) throw new Error('Vault not found in storage');
            const encryptedData = await encryptData(JSON.stringify(newAccounts), derivedKey, vault.meta.salt);
            const updatedVault: EncryptedVault = {
                ...vault,
                data: encryptedData,
            };
            storeVault(updatedVault);
        } catch (error) {
            console.error('Failed to save accounts:', error);
            showToast('Failed to save accounts. Locking vault.');
            lockVault();
        }
    };

    return (
        <AppContext.Provider value={{ accounts, setAccounts: updateAndSaveAccounts, derivedKey, showToast, lockVault }}>
            <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
                {isLocked ? (
                    <LockedScreen onUnlock={handleUnlock} showToast={showToast} />
                ) : (
                    <VaultScreen />
                )}
                {toastMessage && <Toast message={toastMessage} />}
            </div>
        </AppContext.Provider>
    );
};

export default App;
