import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
	},
	privateKeyEncoding: {
		type: 'pkcs1',
		format: 'pem',
	},
});

fs.writeFileSync('public.pem', publicKey);
fs.writeFileSync('private.pem', privateKey);
