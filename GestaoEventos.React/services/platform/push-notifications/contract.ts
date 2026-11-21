export type PushPlatform = 'ios' | 'android';

export type PushRegistrationResult =
  | { status: 'registered'; token: string; platform: PushPlatform }
  | { status: 'denied' }
  | { status: 'unsupported'; reason: string };

export type PushTapData = Record<string, unknown>;
export type PushTapListener = (data: PushTapData) => void;
export type PushUnsubscribe = () => void;
