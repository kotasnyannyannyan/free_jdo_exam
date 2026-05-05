import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  MessageSquare,
  Music,
  RotateCcw,
  ShieldCheck,
  Volume2,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { APP_STORAGE_KEYS } from '../../constants/storageKeys';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowAlert は SDK 53+ で deprecated。新 API (Banner / List) のみ使う。
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen() {
  const [view, setView] = useState<'menu' | 'privacy' | 'version'>('menu');
  
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSeEnabled, setIsSeEnabled] = useState(true);
  
  const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState('20');
  const [tempMinute, setTempMinute] = useState('00');

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  // iOS は ios.buildNumber、Android は android.versionCode を参照。
  // 以前は常に versionCode だけを見ていたため iOS のビルド番号が常に "1" 表示だった。
  const buildNumber = String(
    (Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode) ?? '1'
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedEnabled = await AsyncStorage.getItem('reminder_enabled');
        if (savedEnabled === 'true') setIsPushEnabled(true);

        const savedTime = await AsyncStorage.getItem('reminder_time');
        if (savedTime) setReminderTime(new Date(savedTime));

        const bgm = await AsyncStorage.getItem('bgm_enabled');
        if (bgm !== null) setIsBgmEnabled(bgm === 'true');
        
        const se = await AsyncStorage.getItem('se_enabled');
        if (se !== null) setIsSeEnabled(se === 'true');

      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    loadSettings();
  }, []);

  const scheduleNotification = async (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Android用の通知チャンネル設定
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '学習リマインダー',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // ★修正ポイント：type（毎日）とchannelId（Android用）を明示的に指定
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ドローン免許ナビ 🚁",
        body: "学習の時間です！継続は力なり、今日も少しずつ進めましょう。",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
        channelId: 'default',
      } as any,
    });
  };

  const handleToggleReminder = async (value: boolean) => {
    try {
      if (value) {
        // 権限の確認とリクエスト
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('許可が必要', '端末の設定アプリから通知を許可してください。');
          return;
        }

        await scheduleNotification(reminderTime);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      
      setIsPushEnabled(value);
      await AsyncStorage.setItem('reminder_enabled', value.toString());
      
    } catch (error) {
      console.error("Notification Error:", error);
      Alert.alert('エラー', '通知の設定に失敗しました。');
    }
  };

  const handleToggleBgm = async (value: boolean) => {
    setIsBgmEnabled(value);
    await AsyncStorage.setItem('bgm_enabled', value.toString());
  };

  const handleToggleSe = async (value: boolean) => {
    setIsSeEnabled(value);
    await AsyncStorage.setItem('se_enabled', value.toString());
  };

  const openTimePicker = () => {
    setTempHour(reminderTime.getHours().toString().padStart(2, '0'));
    setTempMinute(reminderTime.getMinutes().toString().padStart(2, '0'));
    setShowTimePicker(true);
  };

  const saveTime = async () => {
    let h = parseInt(tempHour, 10);
    let m = parseInt(tempMinute, 10);

    const hCorrected = isNaN(h) || h < 0 || h > 23;
    const mCorrected = isNaN(m) || m < 0 || m > 59;
    if (hCorrected) h = 20;
    if (mCorrected) m = 0;

    const newDate = new Date();
    newDate.setHours(h, m, 0, 0);

    setReminderTime(newDate);
    setShowTimePicker(false);
    await AsyncStorage.setItem('reminder_time', newDate.toISOString());

    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    if (isPushEnabled) {
      try {
        await scheduleNotification(newDate);
        const correctionNote = (hCorrected || mCorrected)
          ? `無効な値が入力されたため ${timeStr} に補正しました。\n\n`
          : '';
        Alert.alert('設定完了', `${correctionNote}毎日 ${timeStr} に通知します`);
      } catch (error) {
        console.error("Schedule Error:", error);
        Alert.alert('エラー', 'スケジュールの更新に失敗しました。');
      }
    } else if (hCorrected || mCorrected) {
      Alert.alert('入力値を補正しました', `無効な値が入力されたため、${timeStr} に設定しました。`);
    }
  };

  const handleInquiry = () => {
    const subject = encodeURIComponent('問い合わせ/ドローン免許ナビ');
    const deviceInfo = `\n\n---\n機種: ${Device.modelName}\nOS: ${Device.osName} ${Device.osVersion}\nApp: ${appVersion} (${buildNumber})\n---`;
    const body = encodeURIComponent(`こちらにお問い合わせ内容をご記入ください。${deviceInfo}`);
    Linking.openURL(`mailto:info@jpndo.com?subject=${subject}&body=${body}`);
  };

  const handleReset = () => {
    Alert.alert("データの初期化", "記録をすべて消去します。よろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "初期化する", style: "destructive", onPress: async () => {
          await Notifications.cancelAllScheduledNotificationsAsync();
          // AsyncStorage.clear() は外部 SDK（Firebase / AdMob 等）のキーまで巻き込むため、
          // 本アプリが書き込んだキーのみを選択的に削除する。
          await AsyncStorage.multiRemove([...APP_STORAGE_KEYS]);
          Alert.alert("完了", "アプリを再起動してください。");
      }}
    ]);
  };

  if (view === 'privacy') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('menu')} style={styles.backButton}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プライバシーポリシー</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <View style={styles.policyCard}>
            <Text style={styles.policyMainTitle}>日本ドローン機構株式会社{"\n"}プライバシーポリシー</Text>
            <Text style={styles.policySectionTitle}>1. はじめに</Text>
            <Text style={styles.policyText}>
              日本ドローン機構株式会社（以下、「当社」といいます。）は、本アプリ「ドローン免許ナビ」（以下、「本アプリ」といいます。）におけるユーザー情報の取扱いについて、以下の通り定めます。
            </Text>
            <Text style={styles.policySectionTitle}>2. 取得する情報および利用目的</Text>
            <Text style={styles.policyText}>
              本アプリでは、以下の情報を取得し、それぞれの目的で利用します。{"\n"}
              ・ユーザー名：アプリ内での表示のパーソナライズ。{"\n"}
              ・試験予定日：試験日までのカウントダウン機能の提供。{"\n"}
              ・学習履歴：模擬試験の結果表示および苦手分野の分析。
            </Text>
            <Text style={styles.policySectionTitle}>3. データの保存と利用</Text>
            <Text style={styles.policyText}>
              本アプリで収集した属性データおよび学習履歴は、今後のアプリ改善、学習傾向の分析、および当社の関連サービス（セミナーやドローンスクール等）のマーケティング活動を目的として、当社の管理する安全なサーバーへ送信および蓄積されます。また、個人を特定できない統計データとして利用する場合があります。
            </Text>
            <Text style={styles.policySectionTitle}>4. 第三者提供について</Text>
            <Text style={styles.policyText}>
              当社は、法令に基づく場合を除き、取得した情報をユーザーの同意なく第三者に提供することはありません。
            </Text>
            <Text style={styles.policySectionTitle}>5. 免責事項</Text>
            <Text style={styles.policyText}>
              本アプリに掲載されている情報の正確性には万全を期していますが、当社は利用者が本アプリの情報を用いて行う一切の行為について、何ら責任を負うものではありません。
            </Text>
            <Text style={styles.policySectionTitle}>6. お問い合わせ窓口</Text>
            <Text style={styles.policyText}>
              プライバシーポリシーに関するお問い合わせは、下記までお願いいたします。{"\n"}
              日本ドローン機構株式会社 事務局{"\n"}
              メール：info@jpndo.com
            </Text>
            <Text style={styles.policyFooter}>2026年1月11日 制定</Text>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // --- バージョン情報 & 権利表記 ---
  if (view === 'version') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('menu')} style={styles.backButton}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>バージョン情報</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centerScrollContent}>
          <View style={styles.centerContent}>
            <Info size={48} color="#4F46E5" />
            <Text style={styles.versionBig}>Version {appVersion}</Text>
            <Text style={styles.versionSub}>Build {buildNumber}</Text>
            <Text style={styles.copyrightText}>© 日本ドローン機構株式会社</Text>
            
            <View style={styles.rightsContainer}>
              <Text style={styles.rightsTitle}>【問題データの権利】</Text>
              <Text style={styles.rightsText}>
                本アプリに収録されている問題データの著作権は、日本ドローン機構株式会社に帰属します。
                無断での複製、転載、剣窃などの二次利用を固く禁じます。
              </Text>

              <Text style={styles.rightsTitle}>【音楽素材】</Text>
              <Text style={styles.rightsText}>魔王魂</Text>
            </View>

          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>設定</Text></View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionLabel}>通知設定</Text>
        <View style={styles.group}>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><Bell size={20} color="#6366F1" /></View>
              <Text style={styles.itemLabel}>学習リマインダー</Text>
            </View>
            <Switch value={isPushEnabled} onValueChange={handleToggleReminder} trackColor={{ true: '#4F46E5', false: '#CBD5E1' }} />
          </View>
          <TouchableOpacity style={styles.item} onPress={openTimePicker}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconContainer, {backgroundColor: 'transparent'}]}><Clock size={16} color="#64748B" /></View>
              <Text style={styles.itemLabel}>通知時刻</Text>
            </View>
            <View style={styles.timeValueContainer}>
              <Text style={styles.timeValueText}>
                {reminderTime.getHours().toString().padStart(2, '0')}:{reminderTime.getMinutes().toString().padStart(2, '0')}
              </Text>
              <ChevronRight size={16} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>サウンド設定</Text>
        <View style={styles.group}>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><Music size={20} color="#EC4899" /></View>
              <Text style={styles.itemLabel}>BGM</Text>
            </View>
            <Switch value={isBgmEnabled} onValueChange={handleToggleBgm} trackColor={{ true: '#4F46E5', false: '#CBD5E1' }} />
          </View>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><Volume2 size={20} color="#14B8A6" /></View>
              <Text style={styles.itemLabel}>効果音 (SE)</Text>
            </View>
            <Switch value={isSeEnabled} onValueChange={handleToggleSe} trackColor={{ true: '#4F46E5', false: '#CBD5E1' }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>サポート & 法的情報</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={handleInquiry}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><MessageSquare size={20} color="#10B981" /></View>
              <Text style={styles.itemLabel}>お問い合わせ</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setView('privacy')}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><ShieldCheck size={20} color="#F59E0B" /></View>
              <Text style={styles.itemLabel}>プライバシーポリシー</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setView('version')}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><Info size={20} color="#64748B" /></View>
              <Text style={styles.itemLabel}>バージョン情報</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>その他</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={handleReset}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}><RotateCcw size={20} color="#EF4444" /></View>
              <Text style={styles.itemLabel}>データを初期化する</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>通知時刻の設定</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={tempHour}
                onChangeText={setTempHour}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={tempMinute}
                onChangeText={setTempMinute}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.modalHint}>24時間形式で入力してください (00:00 - 23:59)</Text>

            <TouchableOpacity style={styles.saveButton} onPress={saveTime}>
              <Text style={styles.saveButtonText}>保存する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  content: { flex: 1, padding: 20 },
  centerScrollContent: { flexGrow: 1, justifyContent: 'center' },
  centerContent: { alignItems: 'center', padding: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  group: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  itemLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  timeValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeValueText: { fontSize: 16, color: '#4F46E5', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', width: '100%', maxWidth: 320, borderRadius: 24, padding: 24, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  timeInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  timeInput: { width: 80, height: 64, backgroundColor: '#F1F5F9', borderRadius: 16, fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1E293B' },
  timeColon: { fontSize: 32, fontWeight: 'bold', color: '#CBD5E1' },
  modalHint: { fontSize: 13, color: '#94A3B8', marginBottom: 24 },
  saveButton: { backgroundColor: '#4F46E5', width: '100%', padding: 16, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  policyCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  policyMainTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 24, lineHeight: 26 },
  policySectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5', marginTop: 20, marginBottom: 8 },
  policyText: { fontSize: 14, color: '#334155', lineHeight: 24 },
  policyFooter: { fontSize: 12, color: '#94A3B8', marginTop: 32, textAlign: 'right' },
  versionBig: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 16 },
  versionSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  copyrightText: { fontSize: 12, color: '#CBD5E1', marginTop: 8 },
  rightsContainer: { marginTop: 40, width: '100%', paddingHorizontal: 20 },
  rightsTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginTop: 16, marginBottom: 6 },
  rightsText: { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center' },
});
