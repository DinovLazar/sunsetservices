import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {schemaTypes} from './sanity/schemas';

export default defineConfig({
  name: 'sunset-services',
  title: 'Sunset Services',
  projectId: 'i3fawnrl',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {types: schemaTypes},
});
