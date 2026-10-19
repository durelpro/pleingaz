import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController (Endpoints Control Center 15 Rapports D-03)', () => {
  let controller: ReportsController;
  let reportsServiceMock: any;

  beforeEach(async () => {
    reportsServiceMock = {
      getReport: jest.fn(),
      exportReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: reportsServiceMock }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  describe('getReport', () => {
    it('devrait déléguer au ReportsService avec les filtres passés en query param', async () => {
      const mockResult = { reportId: 'R01', isDemo: false, data: [] };
      reportsServiceMock.getReport.mockResolvedValue(mockResult);

      const res = await controller.getReport('R01', { city: 'Douala' });

      expect(reportsServiceMock.getReport).toHaveBeenCalledWith('R01', { city: 'Douala' });
      expect(res).toEqual(mockResult);
    });
  });

  describe('exportReport', () => {
    it('devrait exporter le rapport et positionner les en-têtes HTTP de téléchargement', async () => {
      const mockExport = {
        buffer: Buffer.from('test,csv'),
        filename: 'rapport_r01_123.csv',
        contentType: 'text/csv',
      };
      reportsServiceMock.exportReport.mockResolvedValue(mockExport);

      const resMock = {
        set: jest.fn(),
        send: jest.fn(),
      } as any;

      const reqMock = {
        user: { userId: 'admin-007' },
      };

      await controller.exportReport(
        reqMock,
        'R01',
        { format: 'CSV', filters: { city: 'Yaoundé' } },
        resMock,
      );

      expect(reportsServiceMock.exportReport).toHaveBeenCalledWith(
        'admin-007',
        'R01',
        'CSV',
        { city: 'Yaoundé' },
      );
      expect(resMock.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="rapport_r01_123.csv"',
      });
      expect(resMock.send).toHaveBeenCalledWith(mockExport.buffer);
    });
  });
});
