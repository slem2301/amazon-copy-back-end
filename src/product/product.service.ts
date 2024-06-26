import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { CategoryService } from 'src/category/category.service'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import {
	returnProductObject,
	returnProductObjectFullest
} from 'src/product/return-product.object'
import { convertToNumber } from 'src/utils/convert-to-number'
import { generateSlug } from 'src/utils/generate-slug'
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './dto/product.dto'

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService,
		private categoryService: CategoryService
	) {}

	async getAll(dto: GetAllProductDto) {
		const { perPage, skip } = this.paginationService.getPagination(dto)

		const filters = this.createFilter(dto)

		const products = await this.prisma.product.findMany({
			where: filters,
			orderBy: this.getSortOption(dto.sort),
			skip,
			take: perPage,
			select: returnProductObject
		})

		return {
			products,
			length: await this.prisma.product.count({
				where: filters
			})
		}
	}

	private createFilter(dto: GetAllProductDto): Prisma.ProductWhereInput {
		const filters: Prisma.ProductWhereInput[] = []

		if (dto.searchTerm) filters.push(this.getSearchTermFilter(dto.searchTerm))

		if (dto.ratings)
			filters.push(
				this.getRatingFilter(dto.ratings.split('|').map(rating => +rating))
			)

		if (dto.minPrice || dto.maxPrice)
			filters.push(
				this.getPriceFilter(
					convertToNumber(dto.minPrice),
					convertToNumber(dto.maxPrice)
				)
			)

		if (dto.categoryId) filters.push(this.getCategoryFilter(+dto.categoryId))

		return filters.length ? { AND: filters } : {}
	}

	private getSortOption(
		sort: EnumProductSort
	): Prisma.ProductOrderByWithRelationInput[] {
		switch (sort) {
			case EnumProductSort.LOW_PRICE:
				return [{ price: 'asc' }]
			case EnumProductSort.HIGH_PRICE:
				return [{ price: 'desc' }]
			case EnumProductSort.OLDEST:
				return [{ price: 'asc' }]
			default:
				return [{ price: 'desc' }]
		}
	}

	private getSearchTermFilter(searchTerm: string): Prisma.ProductWhereInput {
		return {
			OR: [
				{
					category: {
						name: {
							contains: searchTerm,
							mode: 'insensitive'
						}
					}
				},
				{
					name: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				},
				{
					description: {
						contains: searchTerm,
						mode: 'insensitive'
					}
				}
			]
		}
	}

	private getRatingFilter(ratings: number[]): Prisma.ProductWhereInput {
		return {
			reviews: {
				some: {
					rating: {
						in: ratings
					}
				}
			}
		}
	}

	private getPriceFilter(
		minPrice?: number,
		maxPrice?: number
	): Prisma.ProductWhereInput {
		let priceFilter: Prisma.IntFilter | undefined = undefined

		if (minPrice) {
			priceFilter = {
				...priceFilter,
				gte: minPrice
			}
		}

		if (maxPrice) {
			priceFilter = {
				...priceFilter,
				lte: maxPrice
			}
		}

		return {
			price: priceFilter
		}
	}

	private getCategoryFilter(categoryId: number): Prisma.ProductWhereInput {
		return {
			categoryId
		}
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: {
				id
			},
			select: returnProductObjectFullest
		})

		if (!product) {
			throw new NotFoundException('Product not found')
		}

		return product
	}

	async bySlug(slug: string) {
		const product = await this.prisma.product.findUnique({
			where: {
				slug
			},
			select: returnProductObjectFullest
		})

		if (!product) {
			throw new NotFoundException('Product not found')
		}

		return product
	}

	async byCategory(categorySlug: string) {
		const products = await this.prisma.product.findMany({
			where: {
				category: {
					slug: categorySlug
				}
			},

			select: returnProductObjectFullest
		})

		if (!products) {
			throw new NotFoundException('Products not found')
		}

		return products
	}

	async getSimilar(id: number) {
		const currentProduct = await this.byId(id)

		if (!currentProduct)
			throw new NotFoundException('Current Product not found')

		const products = await this.prisma.product.findMany({
			where: {
				category: {
					name: currentProduct.category.name
				},
				NOT: {
					id: currentProduct.id
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			select: returnProductObject
		})

		if (!products) {
			throw new NotFoundException('Products not found')
		}

		return products
	}

	async create(dto: ProductDto) {
		const { description, images, price, name, categoryId, userId = 1 } = dto
		return this.prisma.product.create({
			data: {
				description,
				name,
				price,
				slug: generateSlug(name),
				images,
				categoryId,
				userId
			}
		})

		// return this.prisma.product.update({
		// 	where: {
		// 		id: (await product).id
		// 	},
		// 	data: {
		// 		description,
		// 		images,
		// 		name,
		// 		price,
		// 		slug: generateSlug(name),
		// 		category: {
		// 			connect: {
		// 				id: categoryId
		// 			}
		// 		}
		// 	}
		// })
	}

	async update(id: number, dto: ProductDto) {
		const { description, images, price, name, categoryId } = dto

		await this.categoryService.byId(categoryId)

		return this.prisma.product.update({
			where: {
				id
			},
			data: {
				description,
				images,
				name,
				price,
				slug: generateSlug(name),
				category: {
					connect: {
						id: categoryId
					}
				}
			}
		})
	}

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

	async delete(id: number) {
		const review = await this.prisma.review.deleteMany({
			where: {
				productId: id
			}
		})
		console.log(review)

		const product = this.prisma.product.delete({
			where: {
				id
			}
		})

		if (!product) {
			throw new NotFoundException('Product not found')
		}

		return `Remove product: ${(await product).name} and ${review.count}`
	}
}
