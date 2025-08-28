
export interface Account {
  id: string;
  service: string;
  email: string;
  username?: string;
  password_encrypted?: string; // Stored in vault
  password_decrypted?: string; // Held in memory only
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedVault {
  meta: {
    version: string;
    salt: string; 
  };
  data: string; // Base64 of encrypted data (IV + ciphertext)
}
