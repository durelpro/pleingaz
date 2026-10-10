import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateAddressDto {
  city: string;
  neighborhood: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createProfile(userId: string, firstName: string, lastName: string) {
    const profile = await this.prisma.customerProfile.create({
      data: { userId, firstName, lastName },
    });

    await this.audit.log({
      userId,
      action: 'CREATE_PROFILE',
      entity: 'CustomerProfile',
      entityId: profile.id,
    });

    return profile;
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil client non trouvé');
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        customerProfileId: profile.id,
        city: dto.city,
        neighborhood: dto.neighborhood,
        landmark: dto.landmark,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isDefault: dto.isDefault,
      },
    });

    await this.audit.log({
      userId,
      action: 'ADD_ADDRESS',
      entity: 'Address',
      entityId: address.id,
      details: { city: dto.city, neighborhood: dto.neighborhood },
    });

    return address;
  }
}
