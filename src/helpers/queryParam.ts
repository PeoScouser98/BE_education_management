type Param = {
	[key: string]: string;
};

export const paramsStringify = (paramsObj: Param) => {
	if (!paramsObj) return '';
	return (
		'?' +
		Object.keys(paramsObj)
			.map((key) => key + '=' + encodeURIComponent(paramsObj[key]))
			.join('&')
	);
};
