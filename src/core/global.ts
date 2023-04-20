/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */

import { IUser, UserRoleEnum } from '../types/user.type';

declare global {
	namespace Express {
		interface Request {
			role: UserRoleEnum;
			profile: Partial<IUser>;
		}
	}
}
