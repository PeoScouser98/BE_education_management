import swaggerJSDoc from 'swagger-jsdoc';

/**
 * @description config swagger
 */
const swaggerOptions = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		basePath: '/api',
		servers: [
			{
				url: 'http://localhost:3001',
				description: 'Development API',
			},
			{
				url: 'https://education-management-backend.vercel.app',
				description: 'Production API',
			},
		],
		info: {
			title: 'APIs Documentation',
			version: '1.0.0',
			description: 'Documentation for all endpoints',
		},
	},
	apis: ['docs/**/*.yaml'],
});

export default swaggerOptions;
