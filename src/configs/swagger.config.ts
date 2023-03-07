import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @description: config swagger
 */
const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API Documentation',
			version: '1.0.0',
			description: 'Documentation for all endpoints',
		},
	},
	apis: ['./api/controllers/*.ts'],
});

export default swaggerSpec;
