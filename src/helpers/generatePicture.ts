import { paramsStringify } from './queryParams';

const randomHexColor = () => {
	const RanHexColor = Math.floor(Math.random() * 16777215).toString(16);
	return RanHexColor;
};

const generatePicureByName = (char: string) => {
	return (
		'https://ui-avatars.com/api/' +
		paramsStringify({
			// background: 'ccc',
			// color: 'fff',
			name: char
		})
	);
};

export default generatePicureByName;
