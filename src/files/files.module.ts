import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FilesController } from './files.controller'
import { FilesService } from './files.services'
@Module({
	controllers: [FilesController],
	providers: [FilesService, PrismaService]
})
export class FilesModule {}
