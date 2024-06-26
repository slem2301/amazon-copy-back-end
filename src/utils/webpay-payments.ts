'use strict'
import Q from 'q'
import request from 'request'

export default function webPay(shop) {
	this.shop_id = shop.shop_id
	this.shop_key = shop.shop_key
}

webPay.prototype.createPayment = async function (payment, url = '') {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payment)
	})
	const result = await response.json()
	return result
	// parses JSON response into native JavaScript objects
}

webPay.prototype.capturePayment = async function (orderId) {
	// Default options are marked with *
	const response = await fetch(
		`https://sandbox.webpay.by/api/v1/transactions/info/332016426`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)

	// console.log(response)
	return response
	// parses JSON response into native JavaScript objects
}

webPay.prototype.getByOrder = function (order_id, url) {
	const d = Q.defer()

	request(
		{
			method: 'GET',
			uri: url, // 'https://api.bepaid.by/beyag/payments/',
			qs: { order_id: order_id },
			auth: {
				user: this.shop_id,
				pass: this.shop_key
			}
		},
		function (error, res, body) {
			if (error) d.reject(error)
			if (body.errors) d.reject(body)
			d.resolve(body)
		}
	)

	return d.promise
}

// module.exports = webPay
