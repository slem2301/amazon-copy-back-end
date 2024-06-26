import { Injectable } from '@nestjs/common'
import { EnumOrderStatus } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { returnProductObject } from 'src/product/return-product.object'
import HttpUtility from 'src/utils/http-utility'
import SHA1 from 'src/utils/sha1'
import webPay from '../utils/webpay-payments'
import { OrderDto } from './order.dto'

const webpay = new webPay({
	shop_id: process.env.SHOP_ID,
	shop_key: process.env.SHOP_KEY
})

@Injectable()
export class OrderService {
	constructor(private prisma: PrismaService) {}

	async getAll() {
		const orders = this.prisma.order.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				items: {
					include: {
						product: {
							select: returnProductObject
						}
					}
				}
			}
		})
		return orders
	}

	async getByUserId(userId: number) {
		const orders = this.prisma.order.findMany({
			where: {
				userId
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				items: {
					include: {
						product: {
							select: returnProductObject
						}
					}
				}
			}
		})
		return orders
	}

	async placeOrder(dto: OrderDto, userId: number) {
		const total = dto.items.reduce((acc, item) => {
			return acc + item.price * item.quantity
		}, 0)
		// const total = 0

		const itemsPrice = dto.items.map(item => {
			return item.price
		})
		const itemsName = dto.items.map(item => {
			return item.name
		})
		const itemsQuantity = dto.items.map(item => {
			return item.quantity
		})

		function randomInteger(min, max) {
			// получить случайное число от (min-0.5) до (max+0.5)
			const rand = min - 0.5 + Math.random() * (max - min + 1)
			return Math.round(rand)
		}

		const seedRandom = randomInteger(1000000, 9999999)

		const order = await this.prisma.order.create({
			data: {
				status: dto.status,
				items: {
					create: dto.items
				},
				total,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		const payment = await webpay.createPayment(
			{
				wsb_storeid: process.env.SHOP_ID,
				wsb_order_num: order.id,
				wsb_currency_id: 'BYN',
				wsb_version: 2,
				wsb_seed: seedRandom,
				wsb_test: 1,
				wsb_invoice_item_name: itemsName,
				wsb_invoice_item_quantity: itemsQuantity,
				wsb_invoice_item_price: itemsPrice,
				wsb_total: total,
				wsb_signature: SHA1(
					`${seedRandom}${process.env.SHOP_ID}${order.id}1BYN${total}${process.env.SHOP_KEY}`
				),
				wsb_3ds_payment_option: 'force_3ds',
				wsb_store: 'Название Вашего магазина',
				wsb_language_id: 'russian',
				wsb_return_url: 'http://localhost:3000/thanks',
				wsb_cancel_return_url: 'http://localhost:3000/cancel.php',
				wsb_customer_name: 'Иванов Петр Петрович',
				wsb_customer_address: 'Минск ул. Шафарнянская д.11 оф.54',
				wsb_service_date: 'Доставка до 1 января 2022 года',
				wsb_tax: 0,
				wsb_shipping_name: 'Стоимость доставки',
				wsb_shipping_price: 0,
				wsb_discount_name: 'Скидка на товар',
				wsb_discount_price: 0,
				wsb_order_tag: 'Договор №152/12-1 от 12.01.19',
				wsb_email: 'ivanov@test.by',
				wsb_phone: '375291234567',
				wsb_order_contract: 'Договор №152/12-1 от 12.01.19',
				wsb_tab: 'cardPayment'
			},
			'https://securesandbox.webpay.by/api/v1/payment'
		)

		console.log(payment)
		return { payment }
	}
	// async updateStatus(dto) {
	// 	if (dto.event === 'payment.waiting_for_capture') {
	// 	}
	// 	const payment = await webpay.capturePayment('34')
	// 	if (dto.event === 'payment.succeeded') {
	// 		return true
	// 	}

	// 	return { payment }
	// }

	async getByOrder(orderId) {
		const order = await webpay
			.getByOrder(
				'34',
				`https://sandbox.webpay.by/api/v1/transactions/info/${orderId}`
			)
			.then(function (res) {
				console.log(res)
				return res
			})
		return order
	}

	async getAuthPaymentToken() {
		const loginUrl = 'https://sandbox.webpay.by/api/login'
		const loginData = {
			'username': 'anton.vish',
			'password': '123456789'
		}
		const httpUtility = new HttpUtility('')

		httpUtility
			.login(loginUrl, loginData)
			.then(responseData => {
				// POST-запрос для получения auth_token выполнен успешно
				console.log(responseData)

				return responseData
			})
			.catch(error => {
				// Обработка ошибок при выполнении POST-запроса для получения auth_token
				console.error('Error:', error)
			})
	}

	async getByOrderPayment(orderId) {
		const loginUrl = 'https://sandbox.webpay.by/api/login'
		const loginData = {
			'username': 'anton.vish',
			'password': '123456789'
		}

		const httpUtility = new HttpUtility('')

		try {
			const authToken = await httpUtility.login(loginUrl, loginData)
			console.log('Login successful. Auth Token:', authToken)

			const apiUrl = `https://sandbox.webpay.by/api/v1/transactions/info/${orderId}`
			const responseData = await httpUtility.get(apiUrl)

			console.log('Response Data:', responseData.data.orderNum)

			if (responseData.data.status === 'Authorized') {
				console.log('yes')
				const orderId = responseData.data.orderNum
				await this.prisma.order.update({
					where: {
						id: +orderId
					},
					data: {
						status: EnumOrderStatus.PAYED
					}
				})
			}

			return true
		} catch (error) {
			console.error('Error:', error)
			return false
		}
	}
}
