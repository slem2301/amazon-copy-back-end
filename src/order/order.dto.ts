import { EnumOrderStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'
console.log(EnumOrderStatus) // Добавьте эту строку для проверки

export class OrderDto {
	@IsOptional()
	@IsEnum(EnumOrderStatus, { each: true })
	status?: EnumOrderStatus

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[]
}

export class OrderItemDto {
	@IsNumber()
	quantity: number

	@IsNumber()
	price: number

	@IsNumber()
	productId: number

	@IsOptional()
	@IsString()
	name?: string
}

export class OrderIdDto {
	@IsNumber()
	orderId: number
}
