interface ParseDateObject {
    iso: string;
}

function isParseDateObject(value: unknown): value is ParseDateObject {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { iso?: unknown }).iso === 'string'
    );
}

/**
 * Normalises an order's `createdAt`, which may arrive as a Date, an ISO string,
 * a timestamp or a Parse date object (`{ iso }`).
 */
export function parseOrderDate(raw: unknown): Date | null {
    if (!raw) {
        return null;
    }
    if (raw instanceof Date) {
        return raw;
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
        return new Date(raw);
    }
    if (isParseDateObject(raw)) {
        return new Date(raw.iso);
    }
    return null;
}
