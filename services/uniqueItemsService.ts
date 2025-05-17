import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIQUE_ITEMS_KEY = '@recyvision_unique_items';
const ITEM_COUNTS_KEY = '@recyvision_item_counts';

// List of all possible classes
export const ALL_CLASSES = [
    'aerosol_cans',
    'aluminum_food_cans',
    'aluminum_soda_cans',
    'cardboard_boxes',
    'cardboard_packaging',
    'clothing',
    'coffee_grounds',
    'disposable_plastic_cutlery',
    'eggshells',
    'food_waste',
    'glass_beverage_bottles',
    'glass_cosmetic_containers',
    'glass_food_jars',
    'magazines',
    'newspaper',
    'office_paper',
    'paper_cups',
    'plastic_cup_lids',
    'plastic_detergent_bottles',
    'plastic_food_containers',
    'plastic_shopping_bags',
    'plastic_soda_bottles',
    'plastic_straws',
    'plastic_trash_bags',
    'plastic_water_bottles',
    'shoes',
    'steel_food_cans',
    'styrofoam_cups',
    'styrofoam_food_containers',
    'tea_bags',
    'unknown'
];

interface UniqueItemsData {
    userId: string;
    uniqueItems: string[];
    lastUpdated: string;
}

interface ItemCount {
    itemType: string;
    count: number;
}

export const uniqueItemsService = {
    // Get all classes with their counts
    async getAllClassesWithCounts(userId: string): Promise<ItemCount[]> {
        try {
            const counts = await this.getItemCounts(userId);
            const allClassesWithCounts = ALL_CLASSES.map(itemType => {
                const existingCount = counts.find(c => c.itemType === itemType);
                return {
                    itemType,
                    count: existingCount ? existingCount.count : 0
                };
            });
            return allClassesWithCounts;
        } catch (error) {
            console.error('Error getting all classes with counts:', error);
            return ALL_CLASSES.map(itemType => ({ itemType, count: 0 }));
        }
    },

    // Get unique items for a user
    async getUniqueItems(userId: string): Promise<string[]> {
        try {
            const data = await AsyncStorage.getItem(`${UNIQUE_ITEMS_KEY}_${userId}`);
            if (data) {
                const parsedData: UniqueItemsData = JSON.parse(data);
                return parsedData.uniqueItems;
            }
            return [];
        } catch (error) {
            console.error('Error getting unique items:', error);
            return [];
        }
    },

    // Add a new unique item
    async addUniqueItem(userId: string, itemType: string): Promise<string[]> {
        try {
            const currentItems = await this.getUniqueItems(userId);
            
            // Only add if it's a new item type
            if (!currentItems.includes(itemType)) {
                const updatedItems = [...currentItems, itemType];
                const data: UniqueItemsData = {
                    userId,
                    uniqueItems: updatedItems,
                    lastUpdated: new Date().toISOString()
                };
                await AsyncStorage.setItem(`${UNIQUE_ITEMS_KEY}_${userId}`, JSON.stringify(data));
            }

            // Update item count
            await this.incrementItemCount(userId, itemType);
            
            return currentItems;
        } catch (error) {
            console.error('Error adding unique item:', error);
            return [];
        }
    },

    // Get count of unique items
    async getUniqueItemsCount(userId: string): Promise<number> {
        const items = await this.getUniqueItems(userId);
        return items.length;
    },

    // Get scan counts for all items
    async getItemCounts(userId: string): Promise<ItemCount[]> {
        try {
            const data = await AsyncStorage.getItem(`${ITEM_COUNTS_KEY}_${userId}`);
            if (data) {
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('Error getting item counts:', error);
            return [];
        }
    },

    // Increment scan count for an item
    async incrementItemCount(userId: string, itemType: string): Promise<void> {
        try {
            const counts = await this.getItemCounts(userId);
            const existingCount = counts.find(c => c.itemType === itemType);
            
            if (existingCount) {
                existingCount.count += 1;
            } else {
                counts.push({ itemType, count: 1 });
            }

            await AsyncStorage.setItem(`${ITEM_COUNTS_KEY}_${userId}`, JSON.stringify(counts));
        } catch (error) {
            console.error('Error incrementing item count:', error);
        }
    },

    // Reset unique items for a user
    async resetUniqueItems(userId: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`${UNIQUE_ITEMS_KEY}_${userId}`);
            await AsyncStorage.removeItem(`${ITEM_COUNTS_KEY}_${userId}`);
        } catch (error) {
            console.error('Error resetting unique items:', error);
        }
    }
}; 