// src/database/migration.runner.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async runMigrations() {
    try {
      this.logger.log('🔄 Verificando migraciones pendientes...');
      
      // Verificar si hay migraciones pendientes
      const pendingMigrations = await this.dataSource.showMigrations();
      
      if (!pendingMigrations) {
        this.logger.log('✅ No hay migraciones pendientes');
        return;
      }

      this.logger.log('📦 Ejecutando migraciones...');
      await this.dataSource.runMigrations();
      this.logger.log('✅ Migraciones ejecutadas correctamente');
      
    } catch (error) {
      this.logger.error('❌ Error ejecutando migraciones:', error);
      throw error;
    }
  }
}