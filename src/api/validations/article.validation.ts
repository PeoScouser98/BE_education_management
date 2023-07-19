import Joi from 'joi'
import { IArticle } from '../../types/article.type'

export const validateArticle = ( data: Omit<IArticle, '_id'>) => {
	const schema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
		userPosts: Joi.string().required(),
		userPicture: Joi.string().required(),
	})
    
	return schema.validate(data)
}
