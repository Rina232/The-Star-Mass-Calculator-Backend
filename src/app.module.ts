import { Module } from '@nestjs/common';
import { StarClassesModule } from './star-classes/star-classes.module';

@Module({
  imports: [StarClassesModule],
})
export class AppModule {}
