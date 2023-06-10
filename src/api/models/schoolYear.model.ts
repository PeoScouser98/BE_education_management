import mongoose, { ObjectId, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { TPaginatedSchoolYearModel, ISchoolYear } from '../../types/schoolYear.type';

const SchoolYearSchema = new mongoose.Schema<ISchoolYear>(
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
		collection: 'school_years',
		timestamps: true,
	}
);

SchoolYearSchema.pre('save', function () {
	this.endAt = this.startAt + 1;
});

SchoolYearSchema.plugin(mongoosePaginate);

const SchoolYearModel: TPaginatedSchoolYearModel = mongoose.model<
	ISchoolYear,
	TPaginatedSchoolYearModel
>('SchoolYears', SchoolYearSchema);

export default SchoolYearModel;
