import { ArrowRight, Calendar, User, Briefcase, Target, Plane } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 収集するデータの型定義
export type UserMarketingData = {
  name: string;
  date: string;
  age: string;
  gender: string;
  occupation: string;
  hasDrone: string;
  purpose: string;
};

type OnboardingProps = {
  onComplete: (data: UserMarketingData) => void;
  playTap?: () => void;
};

export const OnboardingScreen = ({ onComplete, playTap }: OnboardingProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isUndecided, setIsUndecided] = useState(false);
  
  // マーケティング用State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasDrone, setHasDrone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 選択肢の定義
  const genders = ['男性', '女性', 'その他', '回答しない'];
  const occupations = ['建設・測量', '農業・林業', '空撮・映像制作', 'IT・開発', '学生', 'その他'];
  const purposes = ['趣味・空撮', '業務での活用', '転職・就職', 'スキルアップ'];

  const handleStart = () => {
    playTap?.();

    if (!name.trim()) {
      Alert.alert("確認", "お名前（ニックネーム）を入力してください");
      return;
    }
    const finalDate = isUndecided ? 'undecided' : date;
    if (!isUndecided && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("確認", "試験日は YYYY-MM-DD 形式で入力するか、「未定」を選択してください");
      return;
    }
    if (!age || !gender || !occupation || !hasDrone || !purpose) {
      Alert.alert("確認", "マーケティング向上のため、すべてのアンケート項目にご回答をお願いします");
      return;
    }
    if (!agreed) {
      Alert.alert("確認", "プライバシーポリシーに同意の上、チェックを入れてください");
      return;
    }

    onComplete({
      name,
      date: finalDate,
      age,
      gender,
      occupation,
      hasDrone,
      purpose
    });
  };

  // 選択チップを描画するヘルパー関数
  const renderChips = (options: string[], selectedValue: string, onSelect: (val: string) => void) => (
    <View style={styles.chipContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selectedValue === opt && styles.chipActive]}
          onPress={() => { playTap?.(); onSelect(opt); }}
        >
          <Text style={[styles.chipText, selectedValue === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.title}>ようこそ！</Text>
          <Text style={styles.sub}>最適な学習体験をご提供するため、あなたのことを教えてください</Text>

          {/* 1. 基本情報 */}
          <Text style={styles.sectionTitle}>1. 基本情報</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>お名前 / ニックネーム</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#64748B" />
              <TextInput style={styles.input} placeholder="例: ドローン太郎" value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齢</Text>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} placeholder="例: 35" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />
              <Text style={{color: '#64748B', marginRight: 16}}>歳</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>性別</Text>
            {renderChips(genders, gender, setGender)}
          </View>

          {/* 2. ドローン・試験について */}
          <Text style={styles.sectionTitle}>2. ドローンについて</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ご職業・業界</Text>
            {renderChips(occupations, occupation, setOccupation)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ドローン（機体）の所有</Text>
            {renderChips(['持っている', '持っていない'], hasDrone, setHasDrone)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>資格取得の主な目的</Text>
            {renderChips(purposes, purpose, setPurpose)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>試験予定日</Text>
            {!isUndecided ? (
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#64748B" />
                <TextInput style={styles.input} placeholder="2026-03-31" value={date} onChangeText={setDate} keyboardType="numeric" />
              </View>
            ) : (
              <View style={[styles.inputWrapper, { backgroundColor: '#F1F5F9' }]}>
                <Text style={{ color: '#94A3B8' }}>試験日は未定です</Text>
              </View>
            )}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => { playTap?.(); setIsUndecided(!isUndecided); }}>
              <View style={[styles.checkbox, isUndecided && styles.checkboxActive]} />
              <Text style={styles.checkboxLabel}>まだ決まっていない（未定）</Text>
            </TouchableOpacity>
          </View>

          {/* 3. 同意事項 */}
          <View style={styles.consentBox}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => { playTap?.(); setAgreed(!agreed); }}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]} />
              <Text style={styles.consentText}>
                入力した情報を利用状況の分析およびサービス案内のために送信すること、および<Text style={{color: '#3B82F6', fontWeight:'bold'}}>プライバシーポリシー</Text>に同意します。
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, !agreed && {backgroundColor: '#94A3B8'}]} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.buttonText}>学習を始める</Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 16, paddingTop: 60 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  sub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 16, marginTop: 8, borderBottomWidth: 2, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  input: { flex: 1, marginLeft: 12, fontSize: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#4F46E5' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 12 },
  checkboxActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  checkboxLabel: { fontSize: 13, color: '#64748B' },
  consentBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginTop: 12, marginBottom: 24 },
  consentText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
  button: { backgroundColor: '#1E293B', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});