export type AppEnvironment = 'development' | 'preview' | 'prod';

const configuredEnvironment = process.env.EXPO_PUBLIC_ENV?.trim().toLowerCase();

export const APP_ENVIRONMENT: AppEnvironment =
  configuredEnvironment === 'preview'
    ? 'preview'
    : configuredEnvironment === 'prod' || configuredEnvironment === 'production'
      ? 'prod'
      : 'development';

export const isReleaseEnvironment = APP_ENVIRONMENT === 'preview' || APP_ENVIRONMENT === 'prod';
export const ANALYTICS_ENABLED = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED?.trim().toLowerCase() !== 'false';
