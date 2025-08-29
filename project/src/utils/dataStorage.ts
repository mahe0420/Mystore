// Centralized data storage utility
export interface StorageData {
  users: any[];
  customProducts: any[];
  lastUpdated: string;
}

class DataStorage {
  private storageKey = 'luxe_store_data';
  
  // Initialize default data
  private getDefaultData(): StorageData {
    return {
      users: [
        {
          id: '1',
          email: 'admin@luxe.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user@luxe.com',
          name: 'Demo User',
          role: 'user',
          createdAt: new Date().toISOString(),
        }
      ],
      customProducts: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Get all data
  getAllData(): StorageData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading storage:', error);
    }
    
    // Return default data if nothing stored or error
    const defaultData = this.getDefaultData();
    this.saveAllData(defaultData);
    return defaultData;
  }

  // Save all data
  saveAllData(data: StorageData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      
      // Also save to sessionStorage as backup
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
      
      // Trigger storage event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.storageKey,
        newValue: JSON.stringify(data),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving storage:', error);
    }
  }

  // Get users
  getUsers(): any[] {
    return this.getAllData().users;
  }

  // Save users
  saveUsers(users: any[]): void {
    const data = this.getAllData();
    data.users = users;
    this.saveAllData(data);
  }

  // Add user
  addUser(user: any): void {
    const data = this.getAllData();
    data.users.push(user);
    this.saveAllData(data);
  }

  // Get custom products
  getCustomProducts(): any[] {
    return this.getAllData().customProducts;
  }

  // Save custom products
  saveCustomProducts(products: any[]): void {
    const data = this.getAllData();
    data.customProducts = products;
    this.saveAllData(data);
  }

  // Add custom product
  addCustomProduct(product: any): void {
    const data = this.getAllData();
    data.customProducts.push(product);
    this.saveAllData(data);
  }

  // Update custom product
  updateCustomProduct(productId: number, updatedProduct: any): void {
    const data = this.getAllData();
    const index = data.customProducts.findIndex((p: any) => p.id === productId);
    if (index !== -1) {
      data.customProducts[index] = updatedProduct;
      this.saveAllData(data);
    }
  }

  // Delete custom product
  deleteCustomProduct(productId: number): void {
    const data = this.getAllData();
    data.customProducts = data.customProducts.filter((p: any) => p.id !== productId);
    this.saveAllData(data);
  }

  // Get current user
  getCurrentUser(): any | null {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading current user:', error);
      return null;
    }
  }

  // Save current user
  saveCurrentUser(user: any): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  // Clear current user
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  // Sync data across tabs/windows
  syncData(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        // Data changed in another tab, trigger a refresh
        window.location.reload();
      }
    });
  }

  // Export data (for backup/migration)
  exportData(): string {
    return JSON.stringify(this.getAllData(), null, 2);
  }

  // Import data (for backup/migration)
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveAllData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Create singleton instance
export const dataStorage = new DataStorage();

// Initialize cross-tab synchronization
dataStorage.syncData();