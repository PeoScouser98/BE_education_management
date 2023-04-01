import mongoose, { ObjectId, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface SchoolYear extends Document {
	_id: ObjectId;
	startAt: number;
	endAt: number;
}

type IPaginatedSchoolYearModel = PaginateModel<SchoolYear>

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
