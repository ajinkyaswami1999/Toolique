import type { Tool } from './types';
import { civilTools } from './civil';
import { financeTools } from './finance';
import { devTools } from './dev';
import { mediaTools } from './media';
import { threedTools } from './threed';
import { mathTools } from './math';
import { electricalTools } from './electrical';
import { complianceTools } from './compliance';
import { utilityTools } from './utilities';

export * from './types';
export * from './civil';
export * from './finance';
export * from './dev';
export * from './media';
export * from './threed';
export * from './math';
export * from './electrical';
export * from './compliance';
export * from './utilities';

export const toolsList: Tool[] = [
  ...civilTools,
  ...financeTools,
  ...devTools,
  ...mediaTools,
  ...threedTools,
  ...mathTools,
  ...electricalTools,
  ...complianceTools,
  ...utilityTools,
];
