import createHttpError from 'http-errors';

// so sánh 2 obj có bằng nhau không
export const compareObject = (obj1: any, obj2: any) => {
	const obj1Keys: string[] = sortArrayByLetter(Object.keys(obj1));
	const obj2Keys: string[] = sortArrayByLetter(Object.keys(obj2));

	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}

	const checkValue = obj1Keys.reduce(
		(accumulator, currentValue) =>
			accumulator && obj2Keys.includes(currentValue) && obj2[currentValue] === obj1[currentValue],
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

// tạo ra 1 bảng chỉ chứa 1 thuộc tính xác định từ array gốc
export function getPropertieOfArray(array: any, propertie: string) {
	return array.map((item: any) => {
		if (!item[propertie]) {
			throw createHttpError.BadGateway(`Propertie ${propertie} does not exist in data`);
		}
		return item[propertie];
	});
}

// loại bỏ dấu
export function createSlug(str: string): string {
	str = str.toLowerCase().trim();

	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
	str = str.replace(/đ/g, 'd');
	str = str.replace(/\s+/g, '-');

	return str;
}

// so sánh 2 ngày với nhau
export const compareDates = (date1: Date, date2: Date): number => {
	try {
		const d1 = new Date(formatDate(date1));
		const d2 = new Date(formatDate(date2));

		if (d1.getTime() === d2.getTime()) {
			return 0;
		} else if (d1.getTime() > d2.getTime()) {
			return 1;
		} else {
			return -1;
		}
	} catch (error) {
		throw error;
	}
};

// format date MM-DD-YYYY
export const formatDate = (date: Date): string => {
	try {
		let month = '' + (date.getMonth() + 1);
		let day = '' + date.getDate();
		const year = date.getFullYear();

		if (month.length < 2) {
			month = '0' + month;
		}

		if (day.length < 2) {
			day = '0' + day;
		}

		return [month, day, year].join('-');
	} catch (error) {
		throw error;
	}
};

export const toCapitalize = (value: string) => {
	if (!value || typeof value !== 'string') return;
	value = value.trim().replace(/\s+/g, ' ');
	const subString = value.split(' ');
	const result = subString.map((str) => str.at(0)!.toUpperCase() + str.slice(1).toLowerCase()).join(' ');
	return result;
};
