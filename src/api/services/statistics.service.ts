import StudentModel from '../models/student.model'

export const getStdPercentageByGrade = async () => {
	const allGrades = [1, 2, 3, 4, 5]
	const labels = ['Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5']
	const data = await Promise.all(
		allGrades.map(async (g) => {
			const aggregateResult = await StudentModel.aggregate([
				{ $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'class' } },
				{ $unwind: '$class' },
				{ $match: { 'class.grade': g } },
				{ $count: g.toString() }
			])
			return aggregateResult.at(0) ? aggregateResult.at(0)[g] : 0
		})
	)

	return {
		labels,
		datasets: [
			{
				label: 'Tỉ lệ học sinh giữa các khối',
				data: data,
				backgroundColor: [
					'rgba(16, 185, 129, 1)',
					'rgba(79, 70, 229, 1)',
					'rgba(25, 118, 210, 1)',
					'rgba(231, 31, 105, 1)',
					'rgba(248, 179, 26, 1)'
				],
				borderColor: [
					'rgba(16, 185, 129,0.8)',
					'rgba(79, 70, 229,0.8)',
					'rgba(25, 118, 210,0.8)',
					'rgba(231, 31, 105,0.8)',
					'rgba(248, 179, 26,0.8)'
				],
				borderWith: 1
			}
		]
	}
}
