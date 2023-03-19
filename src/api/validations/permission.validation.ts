import Joi from 'joi';
import { Permission } from '../models/permission.model';

export const validatePermissionData = (data: Omit<Permission, '_id'>) => {
    const schema = Joi.object({
        role: Joi.string().required(),
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
