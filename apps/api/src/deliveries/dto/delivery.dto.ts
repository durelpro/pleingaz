import { VehicleType } from '@pleingaz/database';

export class RegisterCourierDto {
  vehicleType: VehicleType;
  city: string;
  areaName: string;
}

export class UpdateAvailabilityDto {
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
}

export class CompleteDeliveryDto {
  confirmationCode: string;
}

export class RemitCashDto {
  amount: number;
}
