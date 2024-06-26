class AmountPayment {
	value: string
	currency: string
}

class ObjectPayment {
	orderId: string
	status: string
	amount: AmountPayment
	payment_method: string
	credit_card: object
	customer: object
	wsbId: string
}

export class PaymentStatusDto {
	event:
		| 'payment.succeeded'
		| 'payment.waiting_for_capture'
		| 'payment.canceled'
		| 'refund.succeeded'
	type: string
	object: ObjectPayment
}
