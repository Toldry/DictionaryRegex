// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
}); 