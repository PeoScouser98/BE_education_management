import mongoose, { ObjectId, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IPaginatedSchoolYearModel, SchoolYear } from '../../types/schoolYear.type';

const SchoolYearSchema = new mongoose.Schema<SchoolYear>(
	{
		startAt: {
			type: Number,
			default: new Date().getFullYear(),
			unique: true,
		},
		endAt: {
			type: Number,
			unique: true,
		},
	},
	{
		collection: 'schoolyears',
		timestamps: true,
	}
);

SchoolYearSchema.pre('save', function () {
	this.endAt = this.startAt + 1;
});

SchoolYearSchema.plugin(mongoosePaginate);

const SchoolYearModel: IPaginatedSchoolYearModel = mongoose.model<
	SchoolYear,
	IPaginatedSchoolYearModel
>('SchoolYears', SchoolYearSchema);

export default SchoolYearModel;
