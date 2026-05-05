// 本アプリが書き込む AsyncStorage キーの一覧。
// データ初期化時に AsyncStorage.clear() を使うと、外部 SDK
// (Firebase / AdMob / expo-notifications など) のキーまで巻き込んで
// しまうため、ここに列挙したキーのみを multiRemove で削除する。
export const APP_STORAGE_KEYS = [
  // ユーザープロフィール
  'user_name',
  'exam_date',
  'user_age',
  'user_gender',
  'user_occupation',
  'user_has_drone',
  'user_purpose',
  // 学習進捗
  'bookmarks',
  'wrongs',
  // 通知
  'reminder_enabled',
  'reminder_time',
  // サウンド
  'bgm_enabled',
  'se_enabled',
] as const;
