
import { type EncryptedVault } from '../types';

const VAULT_KEY = 'my-passbook-vault';

export const getVault = (): EncryptedVault | null => {
  const vaultString = localStorage.getItem(VAULT_KEY);
  if (!vaultString) {
    return null;
  }
  try {
    return JSON.parse(vaultString);
  } catch (e) {
    console.error('Failed to parse vault from localStorage', e);
    return null;
  }
};

export const storeVault = (vault: EncryptedVault): void => {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
};

export const clearVault = (): void => {
  localStorage.removeItem(VAULT_KEY);
};
