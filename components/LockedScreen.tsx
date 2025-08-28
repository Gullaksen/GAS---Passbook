
import React, { useState, useEffect } from 'react';
import { getVault, storeVault } from '../services/storageService';
import { deriveKey, generateSalt, encryptData } from '../services/cryptoService';
import { type EncryptedVault, type Account } from '../types';
import { KeyIcon } from './icons/KeyIcon';

interface LockedScreenProps {
  onUnlock: (key: CryptoKey) => Promise<void>;
  showToast: (message: string) => void;
}

const LockedScreen: React.FC<LockedScreenProps> = ({ onUnlock, showToast }) => {
  const [hasVault, setHasVault] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);

  useEffect(() => {
    setHasVault(getVault() !== null);
  }, []);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) {
        showToast('Please enter your passphrase.');
        return;
    }
    setIsBusy(true);
    try {
      const vault = getVault();
      if (vault) {
        const salt = new Uint8Array(atob(vault.meta.salt).split('').map(c => c.charCodeAt(0)));
        const key = await deriveKey(passphrase, salt);
        await onUnlock(key);
      }
    } catch (error) {
      console.error(error);
      showToast('Invalid passphrase.');
    } finally {
      setIsBusy(false);
      setPassphrase('');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirmPassphrase) {
      showToast("Passphrases don't match.");
      return;
    }
    if (passphrase.length < 8) {
      showToast('Passphrase must be at least 8 characters.');
      return;
    }
    setIsBusy(true);
    try {
      const saltBytes = generateSalt();
      const saltBase64 = btoa(String.fromCharCode(...saltBytes));
      const key = await deriveKey(passphrase, saltBytes);
      
      const seedAccounts: Account[] = [
          { id: crypto.randomUUID(), service: 'Gmail', email: 'niklas@example.com', username: 'niklasg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: crypto.randomUUID(), service: 'Rema1000 account', email: 'niklas@post.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      const encryptedData = await encryptData(JSON.stringify(seedAccounts), key, saltBase64);
      
      const newVault: EncryptedVault = {
        meta: { version: '1.0', salt: saltBase64 },
        data: encryptedData
      };
      
      storeVault(newVault);
      showToast('Vault created successfully!');
      await onUnlock(key);
    } catch (error) {
      console.error(error);
      showToast('Failed to create vault.');
    } finally {
      setIsBusy(false);
      setPassphrase('');
      setConfirmPassphrase('');
    }
  };

  const renderCreateForm = () => (
    <form onSubmit={handleCreateSubmit} className="space-y-6">
      <div>
        <label htmlFor="new-passphrase" className="block text-sm font-medium text-gray-400">Create Master Passphrase</label>
        <input
          type="password"
          id="new-passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Min 8 characters"
        />
      </div>
      <div>
        <label htmlFor="confirm-passphrase" className="block text-sm font-medium text-gray-400">Confirm Passphrase</label>
        <input
          type="password"
          id="confirm-passphrase"
          value={confirmPassphrase}
          onChange={(e) => setConfirmPassphrase(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Repeat passphrase"
        />
      </div>
      <button type="submit" disabled={isBusy} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500">
        {isBusy ? 'Creating...' : 'Create Vault'}
      </button>
    </form>
  );

  const renderUnlockForm = () => (
    <form onSubmit={handleUnlockSubmit} className="space-y-6">
      <div>
        <label htmlFor="passphrase" className="block text-sm font-medium text-gray-400">Master Passphrase</label>
        <input
          type="password"
          id="passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your passphrase"
        />
      </div>
      <button type="submit" disabled={isBusy} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500">
        {isBusy ? 'Unlocking...' : 'Unlock'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
            <KeyIcon className="mx-auto h-12 w-auto text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {hasVault ? 'My Passbook' : 'Welcome to Passbook'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {hasVault ? 'Your secure vault is locked.' : 'Create a master passphrase to get started.'}
          </p>
        </div>
        {hasVault ? renderUnlockForm() : renderCreateForm()}
      </div>
    </div>
  );
};

export default LockedScreen;
