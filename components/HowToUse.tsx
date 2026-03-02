import { Award, Book, List, PlayCircle, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from './Common';

const GuideSection = ({ icon, title, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export const HowToUseScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <View style={styles.fullScreen}>
      <Header title="使い方の手引き" onBack={onBack} />
      <ScrollView style={styles.padding} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.introBox}>
          <Award size={32} color="#F59E0B" />
          <Text style={styles.introText}>
            ドローン免許ナビへようこそ！このアプリはJDO（日本ドローン機構）の監修に基づき、国家資格合格に必要な「学科」対策をトータルサポートします。
          </Text>
        </View>

        <GuideSection icon={<Book size={24} color="#059669" />} title="教科書モード">
          <Text style={styles.descText}>
            カテゴリごとに10問ずつ区切って出題されます。学習の進捗に合わせて、基礎から着実に知識を身につけたい方におすすめのモードです。
          </Text>
        </GuideSection>

        <GuideSection icon={<PlayCircle size={24} color="#4F46E5" />} title="自由練習モード">
          <Text style={styles.descText}>
            出題数やカテゴリ、一等の問題を含めるかを自由に設定して学習できます。苦手分野の集中対策や、スキマ時間の学習に最適です。
          </Text>
        </GuideSection>

        <GuideSection icon={<Trophy size={24} color="#F59E0B" />} title="模擬試験">
          <Text style={styles.descText}>
            本番の試験と同じ問題数・制限時間で実力を測定します。{"\n"}
            ・<Text style={styles.bold}>二等</Text>：50問 / 30分{"\n"}
            ・<Text style={styles.bold}>一等</Text>：70問 / 75分（計算問題含む）{"\n"}
            回答直後の正誤判定はなく、試験終了後に結果と解説をまとめて確認します。
          </Text>
        </GuideSection>

        <GuideSection icon={<List size={24} color="#64748B" />} title="復習・サポート機能">
          <Text style={styles.descText}>
            ・<Text style={styles.bold}>要復習（間違えた問題）</Text>：過去に間違えた問題を優先的に解き直せます。正解して理解できたらゴミ箱アイコンから削除できます。{"\n"}
            ・<Text style={styles.bold}>問題一覧 / ブックマーク</Text>：全問題の確認や、気になる問題の保存（ブックマーク）機能で効率的に見直しが可能です。
          </Text>
        </GuideSection>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#F8FAFC' },
  padding: { padding: 20 },
  introBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  introText: { textAlign: 'center', fontSize: 14, color: '#475569', lineHeight: 22, marginTop: 12 },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  sectionContent: { borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
  descText: { fontSize: 13, color: '#64748B', lineHeight: 22 },
  bold: { fontWeight: 'bold', color: '#1E293B' },
});