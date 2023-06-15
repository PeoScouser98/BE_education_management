import { paramsStringify } from '../../helpers/queryParams';
import { IUser, UserGenderEnum } from '../../types/user.type';

const getVerificationEmailTemplate = ({
	redirectDomain,
	user,
	token
}: {
	redirectDomain: string;
	user: Pick<IUser, 'displayName' | 'role'>;
	token: string;
}) => {
	return /* html */ `
			<div>
				<p>
					Thân gửi ${user.displayName}!
					<p>
						Người dùng nhận được mail vui lòng click vào <a href='${
							redirectDomain +
							'/api/auth/verify-account' +
							paramsStringify({ user_type: user.role, token: token })
						}'>link</a> này để xác thực tài khoản.
					</p>
					<i>Lưu ý: Mail xác thực này có hiệu lực trong vòng 7 ngày</i>
				</p>
				<hr>
				<p>
					<span style="display: block">Trân trọng!</span>
					<i>Tiểu học Bột Xuyên</i>
				</p>
			</div>
					`;
};

export default getVerificationEmailTemplate;
