exports.colors = [
    '#EC4899',
    '#059669',
    '#EAB308',
    '#CA8A04',
    '#F97316',
    '#DC2626',
    '#F56420',
    '#3B82F6',
    '#8B5CF6',
    '#DB2777',
    '#E14389',
    '#A855F7',
    '#0EA5E9',
    '#7C3AED',
    '#84CC16',
    '#0284C7',
    '#8464A0',
    '#10B981',
    '#F43F5E',
    '#6366F1',
    '#14B8A6',
    '#22C55E',
    '#EF4444',
    '#D946EF',
    '#06B6D4',
    '#F59E0B',
];

exports.shades = [
    {
        id: 0,
        name: 'Red',
        colors: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
    },
    {
        id: 1,
        name: 'Yellow',
        colors: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12']
    },
    {
        id: 2,
        name: 'Blue',
        colors: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']
    },
    {
        id: 3,
        name: 'Cyan',
        colors: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63']
    },
    {
        id: 4,
        name: 'Teal',
        colors: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']
    },
    {
        id: 5,
        name: 'Emerald',
        colors: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b']
    },
    {
        id: 6,
        name: 'Green',
        colors: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
    },
    {
        id: 7,
        name: 'Rose',
        colors: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337']
    },
    {
        id: 8,
        name: 'Pink',
        colors: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843']
    },
    {
        id: 9,
        name: 'Purple',
        colors: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87']
    },
    {
        id: 10,
        name: 'Violet',
        colors: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
    },
    {
        id: 11,
        name: 'Gray',
        colors: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
    },
    {
        id: 12,
        name: 'Orange',
        colors: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']
    },
    {
        id: 13,
        name: 'Indigo',
        colors: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']
    },
    {
        id: 14,
        name: 'Lime',
        colors: ['#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314']
    },
    {
        id: 15,
        name: 'Amber',
        colors: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
    },
];

exports.findShades = function (id) {
    return exports.shades.filter(s => s.id == id)[0].colors;
}

exports.findColor = function (index) {
    return exports.colors[index];
}