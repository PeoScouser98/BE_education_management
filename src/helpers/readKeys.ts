import fs from 'fs';
import path from 'path';

export const publicKey = fs.readFileSync(path.resolve('public.pem'));
export const privateKey = fs.readFileSync(path.resolve('private.pem'));
