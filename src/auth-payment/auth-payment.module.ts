import { Module } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'
import { AuthPaymentController } from './auth-payment.controller'
import { AuthPaymentService } from './auth-payment.service'

@Module({
	controllers: [AuthPaymentController],
	providers: [AuthPaymentService, PrismaService]
})
export class AuthPaymentModule {}
