import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { PrismaService } from './prisma.service'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const prismaService = app.get(PrismaService)
	// await prismaService.enableShutdownHooks(app)

	// Добавьте обработчики событий к объекту process
	process.on('SIGINT', async () => {
		await prismaService.$disconnect()
		process.exit(0)
	})

	process.on('SIGTERM', async () => {
		await prismaService.$disconnect()
		process.exit(0)
	})

	// const storage = multer.diskStorage({
	// 	destination: './uploads/products',
	// 	filename: (req, file, cb) => {
	// 		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
	// 		const fileExtension = file.originalname.split('.').pop()
	// 		cb(null, `${uniqueSuffix}.${fileExtension}`)
	// 	}
	// })

	// const upload = multer({ storage })
	// // eslint-disable-next-line @typescript-eslint/no-var-requires
	// const bodyParser = require('body-parser')

	// app.use(
	// 	bodyParser.urlencoded({
	// 		extended: true
	// 	})
	// )
	// app.use(upload.any())sd

	app.setGlobalPrefix('api')
	app.enableCors()

	await app.listen(4200)
}
bootstrap()
