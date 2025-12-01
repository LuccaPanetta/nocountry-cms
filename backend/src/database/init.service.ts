/* // src/database/init.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);
  private initialized = false;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (this.initialized) return;
    
    this.logger.log('🚀 INICIANDO PROCESO DE INICIALIZACIÓN...');
    
    try {
      // 1. Esperar a que TypeORM se conecte
      await this.waitForConnection();
      
      // 2. Resetear completamente la base de datos
      await this.forceResetDatabase();
      
      // 3. TypeORM automáticamente sincronizará con synchronize: true
      this.logger.log('✅ Base de datos lista - TypeORM sincronizará automáticamente');
      
      this.initialized = true;
    } catch (error) {
      this.logger.error('❌ Error en inicialización:', error);
      throw error;
    }
  }

  private async waitForConnection(maxAttempts = 10): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.dataSource.query('SELECT 1');
        this.logger.log('✅ Conexión a BD establecida');
        return;
      } catch (error) {
        this.logger.log(`⏳ Esperando conexión BD... (${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('No se pudo conectar a la base de datos');
  }

  private async forceResetDatabase() {
    this.logger.log('💥 EJECUTANDO RESET COMPLETO DE LA BASE DE DATOS...');
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Deshabilitar constraints temporalmente
      await queryRunner.query('SET session_replication_role = replica;');

      // Obtener todas las tablas
      const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%' 
        AND tablename NOT LIKE 'sql_%'
        ORDER BY tablename
      `);

      this.logger.log(`🗑️  Eliminando ${tables.length} tablas...`);

      // Eliminar todas las tablas en orden inverso (dependencias primero)
      for (const table of tables.reverse()) {
        try {
          await queryRunner.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
          this.logger.log(`✅ Tabla eliminada: ${table.tablename}`);
        } catch (error) {
          this.logger.warn(`⚠️  No se pudo eliminar ${table.tablename}: ${error.message}`);
        }
      }

      // Rehabilitar constraints
      await queryRunner.query('SET session_replication_role = DEFAULT;');
      
      this.logger.log('✅ RESET COMPLETADO - Todas las tablas eliminadas');
      
    } catch (error) {
      this.logger.error('❌ Error durante el reset:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async isInitialized(): Promise<boolean> {
    return this.initialized;
  }
} */