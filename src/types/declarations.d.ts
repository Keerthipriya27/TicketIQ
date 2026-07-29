declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { IconProps } from 'react-native-vector-icons/Icon';
  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    API_KEY?: string;
    GROQ_API_KEY?: string;
  }
  const Config: NativeConfig;
  export default Config;
}

declare var process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

declare var global: any;
