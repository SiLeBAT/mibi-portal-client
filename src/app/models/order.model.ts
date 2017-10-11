export class Order {
  constructor(
    public orderId: string,
    public natRefLab: string,
    public investigation: string,
    public userId?: string,
  ) {}
}
