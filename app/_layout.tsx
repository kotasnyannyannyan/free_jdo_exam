import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* (tabs)グループを1つの画面として登録 */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* モーダル画面などがある場合の設定 */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: '詳細' }} />
    </Stack>
  );
}