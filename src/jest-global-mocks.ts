const mock = () => {
    let storage: Record<string, string> = {};
    return {
        getItem: (key: string) => key in storage ? storage[key] : null,
        setItem: (key: string, value: string) => storage[key] = value || '',
        removeItem: (key: string) => delete storage[key],
        clear: () => storage = {}
    };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
    value: '<!DOCTYPE html>'
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
    value: () => ({
        enumerable: true,
        configurable: true
    })
});
