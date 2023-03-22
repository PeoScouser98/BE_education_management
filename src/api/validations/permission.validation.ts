import Joi from 'joi';
import { Permission } from '../models/permission.model';

enum Role {
    ADMIN = 'ADMIN',
    HEADMASTER = 'HEADMASTER',
    TEACHER = 'TEACHER',
    PARENTS = 'PARENTS'
}

export const validatePermissionData = (data: Omit<Permission, '_id'>) => {
    const schema = Joi.object({
        role: Joi.string().valid(...Object.values(Role)).required(),
        type: Joi.string().required(),
        permissions: Joi.array()
            .items({
                _id: Joi.string().strip(),
                name: Joi.string()
                    .required(),
                code: Joi.string()
                    .required(),
            }).optional(),
    });
    return schema.validate(data);
};
