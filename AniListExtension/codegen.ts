import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'https://graphql.anilist.co',
    // this assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure
    documents: ['src/**/*.ts'],
    generates: {
        './src/__generated__/': {
            preset: 'client',
            config: {
                documentMode: 'string'
            }
        },
        './schema.graphql': {
            plugins: ['schema-ast'],
            config: {
                includeDirectives: true
            }
        }
    },
    ignoreNoDocuments: true,
};

export default config;