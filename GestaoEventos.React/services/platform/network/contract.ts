export type NetworkAdapterSource = 'android' | 'ios' | 'web';

export type NetworkSnapshot = {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  type: string;
  checkedAt: string;
  source: NetworkAdapterSource;
};

export type NetworkListener = (snapshot: NetworkSnapshot) => void;

export type NetworkUnsubscribe = () => void;
