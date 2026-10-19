export class OrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  storeId?: string;
  items: OrderItemDto[];
  deliveryMode: 'CLICK_AND_COLLECT' | 'HOME_DELIVERY';
  deliveryAddress?: string;
  deliveryNotes?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  paymentMethod: 'CASH' | 'MTN' | 'ORANGE';
}
