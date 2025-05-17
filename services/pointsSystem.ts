// Points configuration for different types of recyclable items
export const RECYCLING_POINTS = {
    // Plastic items
    'plastic_water_bottles': { points: 10, category: 'plastic' },
    'plastic_soda_bottles': { points: 10, category: 'plastic' },
    'plastic_food_containers': { points: 8, category: 'plastic' },
    'plastic_detergent_bottles': { points: 12, category: 'plastic' },
    'plastic_shopping_bags': { points: 5, category: 'plastic' },
    'plastic_cup_lids': { points: 3, category: 'plastic' },
    'plastic_straws': { points: 2, category: 'plastic' },
    'plastic_trash_bags': { points: 4, category: 'plastic' },
    'disposable_plastic_cutlery': { points: 3, category: 'plastic' },

    // Glass items
    'glass_beverage_bottles': { points: 15, category: 'glass' },
    'glass_food_jars': { points: 12, category: 'glass' },
    'glass_cosmetic_containers': { points: 10, category: 'glass' },

    // Metal items
    'aluminum_soda_cans': { points: 8, category: 'metal' },
    'aluminum_food_cans': { points: 8, category: 'metal' },
    'steel_food_cans': { points: 8, category: 'metal' },
    'aerosol_cans': { points: 6, category: 'metal' },

    // Paper items
    'newspaper': { points: 5, category: 'paper' },
    'magazines': { points: 5, category: 'paper' },
    'office_paper': { points: 5, category: 'paper' },
    'cardboard_boxes': { points: 8, category: 'paper' },
    'cardboard_packaging': { points: 6, category: 'paper' },
    'paper_cups': { points: 3, category: 'paper' },

    // Other items
    'styrofoam_cups': { points: 2, category: 'other' },
    'styrofoam_food_containers': { points: 2, category: 'other' },
    'clothing': { points: 15, category: 'other' },
    'shoes': { points: 20, category: 'other' },
    'food_waste': { points: 5, category: 'organic' },
    'coffee_grounds': { points: 3, category: 'organic' },
    'eggshells': { points: 2, category: 'organic' },
    'tea_bags': { points: 2, category: 'organic' },
} as const;

export type RecyclableItem = keyof typeof RECYCLING_POINTS;

export const pointsSystem = {
    // Get points for a specific item
    getPointsForItem(item: RecyclableItem): number {
        return RECYCLING_POINTS[item]?.points || 0;
    },

    // Get category for a specific item
    getCategoryForItem(item: RecyclableItem): string {
        return RECYCLING_POINTS[item]?.category || 'other';
    },

    // Calculate total points for multiple items
    calculateTotalPoints(items: RecyclableItem[]): number {
        return items.reduce((total, item) => total + this.getPointsForItem(item), 0);
    },

    // Get category totals
    getCategoryTotals(items: RecyclableItem[]): Record<string, number> {
        const totals: Record<string, number> = {};
        items.forEach(item => {
            const category = this.getCategoryForItem(item);
            totals[category] = (totals[category] || 0) + 1;
        });
        return totals;
    },

    // Get environmental impact description
    getEnvironmentalImpact(points: number): string {
        if (points >= 1000) return "Environmental Champion!";
        if (points >= 500) return "Eco Warrior!";
        if (points >= 250) return "Green Hero!";
        if (points >= 100) return "Recycling Enthusiast!";
        return "Getting Started!";
    }
}; 