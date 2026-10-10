import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService, CreateAddressDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.prisma.customerProfile.findUnique({
      where: { userId: req.user.userId },
      include: { addresses: true }
    });
  }

  @Post('profile')
  async createProfile(@Request() req: any, @Body() body: { firstName: string; lastName: string }) {
    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId: req.user.userId }
    });
    if (profile) {
      profile = await this.prisma.customerProfile.update({
        where: { userId: req.user.userId },
        data: { firstName: body.firstName, lastName: body.lastName }
      });
      return profile;
    }
    return this.usersService.createProfile(req.user.userId, body.firstName, body.lastName);
  }

  @Post('address')
  async addAddress(@Request() req: any, @Body() body: CreateAddressDto) {
    return this.usersService.addAddress(req.user.userId, body);
  }
}
