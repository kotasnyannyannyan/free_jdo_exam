import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// 共通のテキストスタイル
const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, marginTop: 16 },
  body: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 12 },
  section: { marginBottom: 20 }
});

// 1. 利用規約
export const TermsOfUseText = () => (
  <View>
    <Text style={s.title}>第1条（適用）</Text>
    <Text style={s.body}>本規約は、日本ドローン機構株式会社（以下「当社」）が提供する本アプリの利用条件を定めるものです。</Text>
    <Text style={s.title}>第2条（禁止事項）</Text>
    <Text style={s.body}>利用者は、本アプリの逆アセンブル、修正、二次配布、または公序良俗に反する行為を行ってはなりません。</Text>
    <Text style={s.title}>第3条（免責事項）</Text>
    <Text style={s.body}>本アプリが提供する試験対策情報は学習を支援するものであり、合格を保証するものではありません。また、本アプリの利用により生じた損害について、当社は一切の責任を負いません。</Text>
  </View>
);

// 2. プライバシーポリシー
export const PrivacyPolicyText = () => (
  <View>
    <Text style={s.title}>個人情報の管理</Text>
    <Text style={s.body}>本アプリでは、学習記録の保存のために端末内のストレージを使用しますが、利用者の個人情報を外部サーバーに送信することはありません。</Text>
    <Text style={s.title}>利用目的</Text>
    <Text style={s.body}>収集された学習データは、アプリ内でのスコア表示および学習状況の分析にのみ使用されます。</Text>
    <Text style={s.title}>お問い合わせ</Text>
    <Text style={s.body}>プライバシーに関するお問い合わせは、info@jpndo.com までご連絡ください。</Text>
  </View>
);

// 3. 開発者情報 (日本ドローン機構株式会社)
export const DeveloperInfoText = () => (
  <View>
    <Text style={s.title}>運営会社</Text>
    <Text style={s.body}>日本ドローン機構株式会社 (Japan Drone Organization Co., Ltd. / JDO)</Text>
    <Text style={s.title}>所在地</Text>
    <Text style={s.body}>東京都港区浜松町二丁目１０－１　浜松町ビル２階</Text>
    <Text style={s.title}>事業内容</Text>
    <Text style={s.body}>・無人航空機操縦者の講習・資格認定（登録講習機関）{"\n"}・ドローンによる映像撮影、測量・点検{"\n"}・ドローンの販売・修理・機体点検</Text>
    <Text style={s.title}>公式サイト</Text>
    <Text style={s.body}>https://jpndo.com/</Text>
    <Text style={s.title}>お問合せ先</Text>
    <Text style={s.body}>info@jpndo.com</Text>
  </View>
);