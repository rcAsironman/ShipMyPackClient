// src/types.ts

export interface ShipmentOrder {
  id: string;
  date: string;
  time: string;
  amount: number;
  status: 'ongoing' | 'completed';
  initialImages?: string[]; // Ensure this is an array of strings
}

export type ShipmentTab = 'ongoing' | 'completed';

export interface ShipmentStatus {
  pickedUp: boolean;
  inTransit: boolean;
  delivered: boolean;
}

// For navigation parameters (if you pass 'order' object)
// You might want to explicitly define the route for this new screen too
export type RootStackParamList = {
  OrderDetails: { order: ShipmentOrder }; // For sender view
  TransporterOrderDetails: { order: ShipmentOrder }; // New route for transporter view
  ChatSupport: { order: ShipmentOrder };
  CallSupport: { order: ShipmentOrder };
  MapScreen: { order: ShipmentOrder };
  ReportIssue: { order: ShipmentOrder };
};