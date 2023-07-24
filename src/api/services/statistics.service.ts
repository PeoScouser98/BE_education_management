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
					'rgba(26,50,71,1)',
					'rgba(81,112,129,1)',
					'rgba(168,168,168,1)',
					'rgba(97,155,184,1)',
					'rgba(31,105,142,1)'
				],
				borderColor: [],
				borderWith: 1
			}
		]
	}
}
