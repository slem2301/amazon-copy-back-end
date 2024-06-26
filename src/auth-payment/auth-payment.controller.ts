import { Controller, Post } from '@nestjs/common'
import { AuthPaymentService } from './auth-payment.service'

@Controller('auth_pay')
export class AuthPaymentController {
	constructor(private readonly authPaymentService: AuthPaymentService) {}

	@Post('get_token')
	public async getToken() {
		return this.authPaymentService.getToken()
	}
}
