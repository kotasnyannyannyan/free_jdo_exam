import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from './Common';

export const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <View style={styles.fullScreen}>
      <Header title="プライバシーポリシー" onBack={onBack} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer} // スクロール領域の調整
        showsVerticalScrollIndicator={true}
      >
        {/* 会社名を修正 */}
        <Text style={styles.policyTitle}>日本ドローン機構株式会社 プライバシーポリシー</Text>
        
        <Text style={styles.policyText}>
          日本ドローン機構株式会社（以下、「当社」といいます。）は、JDO公式アプリ「ドローン免許ナビ」（以下、「本アプリ」といいます。）において取得するユーザー情報の取扱いについて、以下の通りプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。{"\n\n"}
          
          <Text style={styles.bold}>第1条（取得する情報）</Text>{"\n"}
          本アプリでは、サービスの提供および向上のため、以下の情報をアプリ内でのみ取得・利用します。{"\n"}
          ・ユーザー名（ニックネーム）{"\n"}
          ・試験予定日{"\n"}
          ・学習の進捗状況（ブックマーク、正誤履歴など）{"\n\n"}

          <Text style={styles.bold}>第2条（利用目的）</Text>{"\n"}
          取得した情報は、以下の目的で利用いたします。{"\n"}
          ・アプリ内でのパーソナライズされたメッセージ表示のため{"\n"}
          ・試験日までのカウントダウン機能提供のため{"\n"}
          ・ユーザーご自身の学習管理のため{"\n\n"}

          <Text style={styles.bold}>第3条（データの管理と保護）</Text>{"\n"}
          本アプリでユーザーが入力した上記の情報は、ご利用の端末内（ローカルストレージ）にのみ保存されます。当社がこれらの情報をサーバー等へ送信・収集することはありません。アプリを削除、または設定リセットを行った場合、これらのデータは端末から完全に消去されます。{"\n\n"}

          <Text style={styles.bold}>第4条（第三者提供）</Text>{"\n"}
          当社は、ユーザーの個人情報を第三者に提供することはありません。{"\n\n"}

          <Text style={styles.bold}>第5条（お問い合わせ）</Text>{"\n"}
          本ポリシーに関するお問い合わせは、日本ドローン機構（JDO）事務局までお願いいたします。{"\n\n"}
          お問い合わせ先：info@jpndo.com
          制定日：2026年1月11日
        </Text>
        {/* スクロール末尾の余白 */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  contentContainer: { 
    padding: 24,
    flexGrow: 1, // コンテンツが画面より小さくてもスクロール可能にする
  },
  policyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#0F172A', textAlign: 'center' },
  policyText: { fontSize: 15, color: '#334155', lineHeight: 26 },
  bold: { fontWeight: '700', color: '#0F172A' }
});