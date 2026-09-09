import { Module } from '@nestjs/common';
import { StarClassesController } from './star-classes.controller';
import { StarClassesService } from './star-classes.service';

@Module({
  controllers: [StarClassesController],
  providers: [StarClassesService],
})
export class StarClassesModule {}
