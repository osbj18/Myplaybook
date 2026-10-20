// Testläget (förhandsversionen på webben) byggs som en enda fil utan uppdelade rutter.
module.exports = ({ config }) => {
  if (process.env.EXPO_PUBLIC_DEMO !== '1') return config;
  return {
    ...config,
    plugins: config.plugins.map((p) => (p === 'expo-router' ? ['expo-router', { asyncRoutes: false }] : p)),
  };
};
