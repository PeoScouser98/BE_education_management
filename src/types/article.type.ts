import { ObjectId } from 'mongoose'

export interface IArticle extends Document {
	_id: ObjectId
	title: string
    content: string
	userPosts: string
	userPicture: string
}
