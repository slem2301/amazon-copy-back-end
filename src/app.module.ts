import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'

import { path } from 'app-root-path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthPaymentModule } from './auth-payment/auth-payment.module'
import { AuthModule } from './auth/auth.module'
import { CategoryModule } from './category/category.module'
import { FilesModule } from './files/files.module'
import { OrderModule } from './order/order.module'
import { PaginationModule } from './pagination/pagination.module'
import { PrismaService } from './prisma.service'
import { ProductModule } from './product/product.module'
import { ReviewModule } from './review/review.module'
import { StatisticsModule } from './statistics/statistics.module'
import { UserModule } from './user/user.module'
import { MulterModule } from '@nestjs/platform-express'

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: `${path}/uploads`,
			serveRoot: '/uploads'
		}),
		MulterModule.register({
			dest: `${path}/uploads`
		}),
		FilesModule,
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		ProductModule,
		ReviewModule,
		CategoryModule,
		OrderModule,
		StatisticsModule,
		PaginationModule,
		AuthPaymentModule
	],
	controllers: [AppController],
	providers: [AppService, PrismaService]
})
export class AppModule {}
