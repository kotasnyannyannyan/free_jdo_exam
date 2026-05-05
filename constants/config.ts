import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// =====================================================
// AdMob 広告ユニット ID
// =====================================================
// TODO(release): 本番リリース前に AdMob 管理画面で発行した本番 Unit ID を
// 下記の定数に設定してください。テスト ID のまま本番アプリを公開すると、
// Google AdMob ポリシー違反となりアカウント停止のリスクがあります。
// =====================================================
const PROD_BANNER_AD_UNIT_ID_IOS = '';
const PROD_BANNER_AD_UNIT_ID_ANDROID = '';
const PROD_INTERSTITIAL_AD_UNIT_ID_IOS = '';
const PROD_INTERSTITIAL_AD_UNIT_ID_ANDROID = '';

const pickProdId = (ios: string, android: string): string | null => {
  const id = Platform.OS === 'ios' ? ios : android;
  return id && id.length > 0 ? id : null;
};

const resolveAdUnit = (
  testId: string,
  prodIos: string,
  prodAndroid: string,
  label: string
): string => {
  if (__DEV__) return testId;
  const prod = pickProdId(prodIos, prodAndroid);
  if (!prod) {
    // 本番ビルドなのに本番 Unit ID が空のときは、誤クリック扱い回避のため
    // テスト ID にフォールバックしつつ警告を出す（収益化前ガード）。
    // eslint-disable-next-line no-console
    console.warn(
      `[admob] ${label} の本番 Unit ID が未設定です。安全のためテスト ID を使用します。リリース前に必ず本番 ID を設定してください。`
    );
    return testId;
  }
  return prod;
};

export const BANNER_AD_UNIT_ID = resolveAdUnit(
  TestIds.BANNER,
  PROD_BANNER_AD_UNIT_ID_IOS,
  PROD_BANNER_AD_UNIT_ID_ANDROID,
  'BANNER'
);

export const INTERSTITIAL_AD_UNIT_ID = resolveAdUnit(
  TestIds.INTERSTITIAL,
  PROD_INTERSTITIAL_AD_UNIT_ID_IOS,
  PROD_INTERSTITIAL_AD_UNIT_ID_ANDROID,
  'INTERSTITIAL'
);

// =====================================================
// プロ版（有料版）誘導ストア URL
// =====================================================
// TODO(release): プロ版のストア配信が確定したら、iOS / Android それぞれの
// 本番 URL に置き換えてください。
// =====================================================
const PRO_VERSION_STORE_URL_IOS = 'https://apps.apple.com/jp/app/id0000000000';
const PRO_VERSION_STORE_URL_ANDROID =
  'https://play.google.com/store/apps/details?id=com.uzura.new_jdo_exam_pro';

export const PRO_VERSION_STORE_URL: string =
  Platform.OS === 'ios' ? PRO_VERSION_STORE_URL_IOS : PRO_VERSION_STORE_URL_ANDROID;
