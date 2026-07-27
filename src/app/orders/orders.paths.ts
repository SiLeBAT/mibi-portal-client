export const ordersPathsSegments = {
    orders: 'orders',
    results: 'results'
};

export const ordersPaths = {
    results: '/' + ordersPathsSegments.orders + '/' + ordersPathsSegments.results
};

export function orderResultsPath(orderId: string): string {
    return ordersPaths.results + '/' + orderId;
}
