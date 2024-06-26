import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { OrderDto } from './order.dto'
import { OrderService } from './order.service'

@Controller('orders')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Get()
	@Auth('admin')
	getAll() {
		return this.orderService.getAll()
	}

	@Get('by-user')
	@Auth()
	getByUserId(@CurrentUser('id') userId: number) {
		return this.orderService.getByUserId(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	placeOrder(@Body() dto: OrderDto, @CurrentUser('id') userId: number) {
		// console.log(this)
		return this.orderService.placeOrder(dto, userId)
	}

	// @HttpCode(200)
	// @Get('status')
	// updateStatus(@Body() dto: PaymentStatusDto) {
	// 	return this.orderService.updateStatus(dto)
	// }

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Get('get_payment_token')
	public async getToken() {
		return this.orderService.getAuthPaymentToken()
	}

	@Get('get_payment_order/:order_id')
	public async getByOrderPayment(@Param('order_id') order_id: string) {
		return this.orderService.getByOrderPayment(order_id)
	}
}
