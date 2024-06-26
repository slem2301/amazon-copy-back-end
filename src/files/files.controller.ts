import {
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Res,
	UploadedFile,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.services'
@Controller('files')
export class FilesController {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor(private readonly filesService: FilesService) {}
	// upload single file

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		const uploadedFile = this.filesService.uploadImage(file)
		return uploadedFile
	}

	// @Post('uploadMultipleFiles')
	// @UseInterceptors(
	// 	FilesInterceptor('file', 10, {
	// 		storage: diskStorage({
	// 			destination: './uploads',
	// 			filename: editFileName
	// 		}),
	// 		fileFilter: imageFileFilter
	// 	})
	// )
	// async uploadMultipleFiles(@UploadedFiles() files) {
	// 	const response = []
	// 	files.forEach(file => {
	// 		const fileReponse = {
	// 			originalname: file.originalname,
	// 			filename: file.filename
	// 		}
	// 		response.push(fileReponse)
	// 	})
	// 	return {
	// 		status: HttpStatus.OK,
	// 		message: 'Images uploaded successfully!',
	// 		data: response
	// 	}
	// }

	@Post('upload-multiple')
	@UseInterceptors(FilesInterceptor('file', 10))
	uploadFiles(@UploadedFiles() files) {
		return this.filesService.uploadMultipleFiles(files)
	}
	@Get(':imagename')
	getImage(@Param('imagename') image, @Res() res) {
		const response = res.sendFile(image, { root: './uploads' })
		return {
			status: HttpStatus.OK,
			data: response
		}
	}
}
