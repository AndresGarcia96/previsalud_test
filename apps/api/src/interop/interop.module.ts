import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InteropController } from './controllers/interop.controller';
import { InteropService } from './services/interop.service';

import { InteropAudit } from './entities/interop-audit.entity';
import { InteropCache } from './entities/interop-cache.entity';

import { FhirAdapter } from './adapters/fhir.adapter';
import { Hl7Adapter } from './adapters/hl7.adapter';
import { CdaAdapter } from './adapters/cda.adapter';
import { RestAdapter } from './adapters/rest.adapter';
import { SoapAdapter } from './adapters/soap.adapter';

import { UserModule } from 'user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([InteropAudit, InteropCache]), UserModule],
  controllers: [InteropController],
  providers: [
    InteropService,
    FhirAdapter,
    Hl7Adapter,
    CdaAdapter,
    RestAdapter,
    SoapAdapter,
  ],
  exports: [InteropService],
})
export class InteropModule {}
