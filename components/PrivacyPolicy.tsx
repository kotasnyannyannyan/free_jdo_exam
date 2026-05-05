import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from './Common';

export const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <View style={styles.fullScreen}>
      <Header title="プライバシーポリシー" onBack={onBack} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.policyTitle}>日本ドローン機構株式会社 プライバシーポリシー</Text>
        
        <Text style={styles.policyText}>
          日本ドローン機構株式会社（以下、「当社」といいます。）は、JDO公式アプリ「ドローン免許ナビ」（以下、「本アプリ」といいます。）におけるユーザー情報の取扱いについて、以下の通りプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。{"\n\n"}
          
          <Text style={styles.bold}>第1条（取得する情報）</Text>{"\n"}
          本アプリでは、サービスの提供および向上のため、以下の情報を取得・利用します。{"\n"}
          ・ユーザー名（ニックネーム）{"\n"}
          ・試験予定日{"\n"}
          ・年齢、性別、ご職業・業界、ドローン機体の所有有無、資格取得の目的{"\n"}
          ・学習の進捗状況（学習履歴、正誤履歴、ブックマーク等）{"\n"}
          ・端末プラットフォーム情報（iOS / Android の別）{"\n\n"}

          <Text style={styles.bold}>第2条（利用目的）</Text>{"\n"}
          取得した情報は、以下の目的で利用いたします。{"\n"}
          ・アプリ内でのパーソナライズされたメッセージ表示のため{"\n"}
          ・試験日までのカウントダウン機能提供のため{"\n"}
          ・ユーザーご自身の学習管理および苦手分野の分析のため{"\n"}
          ・本アプリの改善およびサービス品質の向上のため{"\n"}
          ・当社の関連サービス（セミナー、ドローンスクール等）の案内のため{"\n\n"}

          <Text style={styles.bold}>第3条（データの保存と利用）</Text>{"\n"}
          本アプリで収集した属性情報および学習履歴は、今後のアプリ改善、学習傾向の分析、および当社の関連サービスのマーケティング活動を目的として、当社の管理する安全なサーバー（Google Cloud / Firebase）へ送信および蓄積されます。また、個人を特定できない統計データとして利用する場合があります。{"\n\n"}

          <Text style={styles.bold}>第4条（第三者提供）</Text>{"\n"}
          当社は、法令に基づく場合を除き、取得した情報をユーザーの同意なく第三者に提供することはありません。{"\n\n"}

          <Text style={styles.bold}>第5条（広告配信について）</Text>{"\n"}
          本アプリ（無料版）では、Google AdMob を利用して広告を配信しています。広告配信のため AdMob が広告 ID 等の情報を取得する場合があります。詳細は Google のプライバシーポリシーをご確認ください。{"\n\n"}

          <Text style={styles.bold}>第6条（免責事項）</Text>{"\n"}
          本アプリに掲載されている情報の正確性には万全を期していますが、当社は利用者が本アプリの情報を用いて行う一切の行為について、何ら責任を負うものではありません。{"\n\n"}

          <Text style={styles.bold}>第7条（お問い合わせ）</Text>{"\n"}
          本ポリシーに関するお問い合わせは、日本ドローン機構（JDO）事務局までお願いいたします。{"\n\n"}
          お問い合わせ先：info@jpndo.com{"\n"}
          制定日：2026年1月11日
        </Text>
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
    flexGrow: 1,
  },
  policyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#0F172A', textAlign: 'center' },
  policyText: { fontSize: 15, color: '#334155', lineHeight: 26 },
  bold: { fontWeight: '700', color: '#0F172A' }
});
