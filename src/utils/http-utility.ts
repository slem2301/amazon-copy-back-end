import axios, { AxiosRequestConfig } from 'axios'

class HttpUtility {
	private authToken: string

	constructor(authToken: string) {
		this.authToken = authToken
	}

	public async login(url: string, data: any) {
		try {
			const response = await axios.post(url, data)
			const responseData = response.data
			this.authToken = responseData.data.auth_token
			return this.authToken
		} catch (error) {
			throw new Error(`Error in login request: ${error}`)
		}
	}

	public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
		if (!this.authToken) {
			throw new Error('Authorization token not available. Please login first.')
		}

		const headers = {
			...config?.headers,
			Authorization: `Bearer ${this.authToken}`
		}

		const requestConfig: AxiosRequestConfig = {
			...config,
			headers
		}

		try {
			const response = await axios.get(url, requestConfig)
			return response.data
		} catch (error) {
			throw new Error(`Error in GET request: ${error}`)
		}
	}
}

export default HttpUtility
