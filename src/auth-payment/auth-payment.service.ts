import { Injectable } from '@nestjs/common'
import HttpUtility from 'src/utils/http-utility'

@Injectable()
export class AuthPaymentService {
	private readonly apiUrl = 'https://sandbox.webpay.by/api/login'

	public async getToken() {
		const requestData = {
			merchantId: 937835205,
			username: 'anton.vish',
			password: '123456789'
		}

		const httpUtility = new HttpUtility('')

		// const response = await httpUtility.login(this.apiUrl, requestData)
		// // const token = response.data.data.auth_token // Предположим, токен возвращается в поле 'token' в ответе API
		// console.log(response)
		// return response

		httpUtility
			.login(this.apiUrl, requestData)
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
}
