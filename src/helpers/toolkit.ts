// so sánh 2 obj có bằng nhau không
export const compareObject = (obj1: any, obj2: any) => {
	const obj1Keys: string[] = sortArrayByLetter(Object.keys(obj1));
	const obj2Keys: string[] = sortArrayByLetter(Object.keys(obj2));

	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}

	const checkValue = obj1Keys.reduce(
		(accumulator, currentValue) =>
			accumulator &&
			obj2Keys.includes(currentValue) &&
			obj2[currentValue] === obj1[currentValue],
		true
	);

	return checkValue;
};

export function sortArrayByLetter(array: string[]): string[] {
	return array.sort(function (a, b) {
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		} else {
			return 0;
		}
	});
}
