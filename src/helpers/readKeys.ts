import fs from 'fs';

export const publicKey = fs.readFileSync('public.pem');
export const privateKey = fs.readFileSync('private.pem');
