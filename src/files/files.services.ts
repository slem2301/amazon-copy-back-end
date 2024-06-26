import { Injectable, NotFoundException } from '@nestjs/common'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class FilesService {
	constructor(private prisma: PrismaService) {}

	async uploadImage(file: Express.Multer.File): Promise<string> {
		console.log('file:' + file)
		if (!file) {
			throw new NotFoundException('No file provided00')
		}
		const { originalname, buffer } = file

		// Проверьте, существует ли папка 'uploads/products'
		const uploadDir = join(process.cwd(), 'uploads/products')
		if (!existsSync(uploadDir)) {
			mkdirSync(uploadDir, { recursive: true })
		}

		// Сгенерируйте уникальное имя файла
		const fileName = `${Date.now()}-${originalname}`
		const filePath = join(uploadDir, fileName)

		// Запишите файл в папку
		const writeStream = createWriteStream(filePath)
		writeStream.write(buffer)
		writeStream.end()

		return `/uploads/products/${fileName}` // Вернуть полное имя файла
	}

	async uploadMultipleFiles(
		files: Express.Multer.File[]
	): Promise<{ data: any[] }> {
		const response = []

		const uploadDir = join(process.cwd(), 'uploads/products')
		if (!existsSync(uploadDir)) {
			mkdirSync(uploadDir, { recursive: true })
		}

		for (const file of files) {
			const { originalname, buffer } = file
			const fileName = `${Date.now()}-${originalname}`
			const filePath = join(uploadDir, fileName)

			const writeStream = createWriteStream(filePath)
			writeStream.write(buffer)
			writeStream.end()

			response.push({
				originalname: originalname,
				filename: fileName,
				filepath: `/uploads/products/${fileName}`
			})
		}

		return { data: response }
	}
}
