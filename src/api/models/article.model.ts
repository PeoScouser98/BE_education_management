import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

import { IArticle } from '../../types/article.type'
import { toCapitalize } from '../../helpers/toolkit'


const ArticleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        expires: '30d' // auto delete after 37 weeks
    }
)

ArticleSchema.plugin(mongoosePaginate)

ArticleSchema.pre('save', function (next) {
	this.title = toCapitalize(this.title)
	next()
})


const AttendanceModel = mongoose.model<IArticle>('Attendance', ArticleSchema)

export default AttendanceModel
