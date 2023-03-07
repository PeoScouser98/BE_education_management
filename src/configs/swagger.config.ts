import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @description config swagger
 */
const swaggerOptions = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		basePath: '/api',
		info: {
			title: 'APIs Documentation',
			version: '1.0.0',
			description: 'Documentation for all endpoints',
		},
	},
	apis: ['documents/**/*.yaml'],
});

export default swaggerOptions;
