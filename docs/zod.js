import { zodToJsonSchema } from 'zod-to-json-schema';

export function toOpenApi(zodSchema, name) {
  // name helps create stable component names in OpenAPI
  return zodToJsonSchema(zodSchema, { name, target: 'openApi3' });
}
