import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountCasesService, CreateCaseDto, ProposePhoneChangeDto } from './account-cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('account-cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountCasesController {
  constructor(private readonly casesService: AccountCasesService) {}

  /**
   * Création d'un dossier d'assistance par un gestionnaire de compte ou un admin
   */
  @Post()
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createCase(@CurrentUser('id') agentId: string, @Body() body: CreateCaseDto) {
    return this.casesService.createCase(agentId, body);
  }

  /**
   * Liste des dossiers d'assistance
   */
  @Get()
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getCases(@Query('status') status?: string, @Query('agentId') agentId?: string) {
    return this.casesService.getCases({ status, agentId });
  }

  /**
   * Consultation d'un dossier avec coordonnées masquées
   */
  @Get(':id')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getCaseById(@Param('id') caseId: string) {
    return this.casesService.getCaseById(caseId);
  }

  /**
   * Démasquage exceptionnel du numéro complet avec motif obligatoire
   */
  @Post(':id/unmask-phone')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async unmaskPhone(
    @Param('id') caseId: string,
    @CurrentUser('id') agentId: string,
    @Body() body: { justification: string },
  ) {
    return this.casesService.unmaskPhone(caseId, agentId, body.justification);
  }

  /**
   * Levée du verrouillage temporaire (Lockout)
   */
  @Post(':id/unlock-account')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async unlockAccount(@Param('id') caseId: string, @CurrentUser('id') agentId: string) {
    return this.casesService.unlockAccount(caseId, agentId);
  }

  /**
   * Révocation forcée de toutes les sessions
   */
  @Post(':id/revoke-sessions')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async revokeSessions(@Param('id') caseId: string, @CurrentUser('id') agentId: string) {
    return this.casesService.revokeSessions(caseId, agentId);
  }

  /**
   * Proposition formelle de changement de numéro (soumise à approbation ADMIN)
   */
  @Post(':id/propose-phone-change')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async proposePhoneChange(
    @Param('id') caseId: string,
    @CurrentUser('id') agentId: string,
    @Body() body: ProposePhoneChangeDto,
  ) {
    return this.casesService.proposePhoneChange(caseId, agentId, body);
  }

  /**
   * Approbation ou rejet Maker-Checker par un rôle ADMIN distinct
   */
  @Post(':id/admin-approve')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async adminApprove(
    @Param('id') caseId: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { approved: boolean; adminNotes?: string },
  ) {
    return this.casesService.adminApprovePhoneChange(caseId, adminId, body.approved, body.adminNotes);
  }

  /**
   * Clôture du dossier
   */
  @Post(':id/close')
  @Roles('ACCOUNT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async closeCase(@Param('id') caseId: string, @CurrentUser('id') agentId: string) {
    return this.casesService.closeCase(caseId, agentId);
  }
}
