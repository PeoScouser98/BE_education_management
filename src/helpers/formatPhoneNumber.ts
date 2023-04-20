export default function formatPhoneNumber(phoneNumber: string) {
	return '84' + phoneNumber.slice(1);
}
console.log(formatPhoneNumber('0336089988'));
