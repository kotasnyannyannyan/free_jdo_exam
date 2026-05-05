import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useFocusEffect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  Book,
  Bookmark,
  HelpCircle,
  List,
  PlayCircle,
  Trophy,
  Lock,
  Crown,
  X,
  ChevronRight
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image, Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View,
  Modal,
  Linking
} from 'react-native';

// ▼ Firebase用のインポートを追加
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { shuffle } from '../../utils/array';
import { parseLocalDate } from '../../utils/date';

import { MenuCard } from '../../components/Common';
import { HowToUseScreen } from '../../components/HowToUse';
import { OnboardingScreen } from '../../components/Onboarding';
import { PrivacyPolicyScreen } from '../../components/PrivacyPolicy';
import { PracticeConfigScreen, ProblemListScreen, QuizSessionView, TextbookModeScreen } from '../../components/SubjectExam';
import { ALL_QUESTIONS, QuizItem } from '../../constants/questions';

import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID, PRO_VERSION_STORE_URL } from '../../constants/config';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

const HomeView = ({ 
  onNavigate, 
  userName, 
  examDate, 
  wrongCount, 
  bookmarkedCount, 
  onStartMock, 
  onStartReview,
  playTap
}: any) => {
  const [imgError, setImgError] = useState(false);

  // ▼ プロ版誘導ポップアップの表示管理
  const [isPremiumModalVisible, setPremiumModalVisible] = useState(false);

  const getCountdown = () => {
    if (examDate === 'undecided' || !examDate) return null;
    const target = parseLocalDate(examDate);
    if (!target) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getCountdown();

  const handleNav = (target: string) => {
    playTap();
    onNavigate(target);
  };

  // ▼ ストアへ飛ぶ関数（本番URLは constants/config.ts の PRO_VERSION_STORE_URL を編集）
  const openStore = () => {
    playTap();
    Linking.openURL(PRO_VERSION_STORE_URL);
    setPremiumModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          {!imgError ? (
            <Image 
              source={require('../../assets/images/jdo-logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
              onError={() => setImgError(true)} 
            />
          ) : (
            <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>JDO</Text></View>
          )}
        </View>
        <Text style={styles.heroTitle}>ドローン免許ナビ</Text>
        <Text style={styles.heroSubtitle}>JDO公式 試験対策アプリ</Text>
      </View>

      <ScrollView style={styles.padding} showsVerticalScrollIndicator={false}>
        <View style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Trophy size={20} color="#F59E0B" />
            <Text style={styles.messageUserText}>こんにちは、{userName}さん！</Text>
          </View>
          {daysLeft !== null && daysLeft >= 0 ? (
            <View style={styles.countdownRow}>
              <Text style={styles.countdownText}>試験まであと</Text>
              <Text style={styles.daysValue}>{daysLeft}</Text>
              <Text style={styles.countdownText}>日</Text>
            </View>
          ) : (
            <Text style={styles.encouragementText}>目標に向かって、一歩ずつ！</Text>
          )}
        </View>

        {/* ▼ 要復習ボタン（プロ版限定にロック） */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statBox, { backgroundColor: '#FFF7ED', flex: 1, opacity: 0.85 }]}
            onPress={() => {
              playTap();
              setPremiumModalVisible(true); // ★無料版はポップアップを出す
            }}
          >
            {/* プロ版限定バッジ */}
            <View style={[styles.premiumBadge, { backgroundColor: '#F97316', alignSelf: 'flex-end', position: 'absolute', top: 8, right: 8 }]}>
              <Lock size={10} color="#FFF" />
              <Text style={styles.premiumBadgeText}>プロ版</Text>
            </View>

            <Text style={[styles.statLabel, { color: '#C2410C' }]}>要復習（間違えた問題）</Text>
            <Text style={[styles.statValue, { color: '#EA580C' }]}>{wrongCount}問</Text>
            <Text style={{fontSize: 10, color:'#C2410C', marginTop:4}}>弱点を一気に克服！</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>学習を始める</Text>
        
        <TouchableOpacity style={[styles.mainActionCard, {marginBottom: 12}]} onPress={() => handleNav('textbook-mode')}>
          <View style={[styles.actionIconContainer, {backgroundColor: '#ECFDF5'}]}>
            <Book size={32} color="#059669" />
          </View>
          <View>
            <Text style={styles.actionTitle}>教科書モード</Text>
            <Text style={styles.actionSub}>カテゴリごとに10問ずつ着実に学習</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainActionCard} onPress={() => handleNav('practice-config')}>
          <View style={styles.actionIconContainer}>
            <PlayCircle size={32} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.actionTitle}>自由練習モード</Text>
            <Text style={styles.actionSub}>問題数やカテゴリを選んで学習</Text>
          </View>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>模擬試験 (本番形式)</Text>
        <View style={styles.mockContainer}>
          {/* ▼ 模擬試験（二等）：プロ版限定にロック */}
          <TouchableOpacity 
            style={[styles.mockCard, { opacity: 0.85 }]} 
            onPress={() => { playTap(); setPremiumModalVisible(true); }}
          >
            <View style={[styles.premiumBadge, { alignSelf: 'flex-start' }]}>
              <Lock size={10} color="#FFF" />
              <Text style={styles.premiumBadgeText}>プロ版</Text>
            </View>
            <Text style={styles.mockTitle}>二等学科試験</Text>
            <Text style={styles.mockSub}>50問 / 30分</Text>
          </TouchableOpacity>

          {/* ▼ 模擬試験（一等）：プロ版限定にロック */}
          <TouchableOpacity 
            style={[styles.mockCard, { borderColor: '#9333EA', opacity: 0.85 }]} 
            onPress={() => { playTap(); setPremiumModalVisible(true); }}
          >
            <View style={[styles.premiumBadge, { alignSelf: 'flex-start', backgroundColor: '#9333EA' }]}>
              <Lock size={10} color="#FFF" />
              <Text style={styles.premiumBadgeText}>プロ版</Text>
            </View>
            <Text style={[styles.mockTitle, { color: '#9333EA' }]}>一等学科試験</Text>
            <Text style={[styles.mockSub, { color: '#A855F7' }]}>70問 / 75分</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>復習・ツール</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.toolCard} onPress={() => handleNav('problem-list')}>
            <List size={24} color="#64748B" />
            <Text style={styles.toolLabel}>問題一覧</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => { playTap(); onStartReview('bookmark'); }}>
            <Bookmark size={24} color="#F59E0B" fill={bookmarkedCount > 0 ? "#F59E0B" : "none"} />
            <Text style={styles.toolLabel}>ブックマーク ({bookmarkedCount})</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>その他</Text>
        <MenuCard title="使い方の手引き" sub="アプリの活用方法" icon={<HelpCircle size={28} color="#64748B" />} onPress={() => handleNav('how-to-use')} color="#F1F5F9" />
        
        <View style={styles.footerInfo}>
          <TouchableOpacity onPress={() => handleNav('privacy')}>
            <Text style={styles.privacyLink}>プライバシーポリシー</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Produced by 日本ドローン機構株式会社</Text>
          <View style={{ height: 100 }} /> 
        </View>
      </ScrollView>

      {/* ▼▼▼ プロ版誘導ポップアップ ▼▼▼ */}
      <Modal
        visible={isPremiumModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.premiumCard}>
            {/* 閉じるボタン */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => { playTap(); setPremiumModalVisible(false); }}
            >
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.premiumIconBox}>
              <Crown size={48} color="#F59E0B" />
            </View>

            <Text style={styles.premiumTitle}>プロ版にアップグレードして{'\n'}合格を確実なものに！</Text>
            
            <View style={styles.premiumFeatures}>
              <Text style={styles.premiumFeatureItem}>✅ <Text style={{fontWeight:'bold'}}>模擬試験モード</Text>（本番形式・合否判定）</Text>
              <Text style={styles.premiumFeatureItem}>✅ <Text style={{fontWeight:'bold'}}>要復習モード</Text>（弱点問題の集中特訓）</Text>
              <Text style={styles.premiumFeatureItem}>✅ <Text style={{fontWeight:'bold'}}>一等免許</Text>を含む全問題（約400問）解放</Text>
              <Text style={styles.premiumFeatureItem}>✅ 広告の完全非表示でサクサク学習</Text>
            </View>

            <Text style={styles.premiumPrice}>買い切り 2,000円</Text>

            {/* ストアへ飛ぶボタン */}
            <TouchableOpacity style={styles.storeButton} onPress={openStore}>
              <Text style={styles.storeButtonText}>プロ版をチェックする</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.premiumSubText}>※タップするとストアページに移動します</Text>
          </View>
        </View>
      </Modal>
      {/* ▲▲▲ プロ版誘導ポップアップ ▲▲▲ */}

    </View>
  );
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [appIsReady, setAppIsReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<number>>(new Set());
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizMode, setQuizMode] = useState<any>('practice');
  const [timeLeft, setTimeLeft] = useState(0);

  const [soundObjects, setSoundObjects] = useState<any>({});
  // クリーンアップ時の stale closure を避けるための ref。
  // useEffect の cleanup で setSoundObjects の初期値を見てしまうと unloadAsync が走らずリークする。
  const soundObjectsRef = useRef<any>({});
  const [currentBgmKey, setCurrentBgmKey] = useState<string | null>(null);
  
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSeEnabled, setIsSeEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadAudioSettings = async () => {
        try {
          const bgm = await AsyncStorage.getItem('bgm_enabled');
          const se = await AsyncStorage.getItem('se_enabled');
          if (bgm !== null) setIsBgmEnabled(bgm === 'true');
          if (se !== null) setIsSeEnabled(se === 'true');
        } catch (e) {}
      };
      loadAudioSettings();
    }, [])
  );

  useEffect(() => {
    async function loadSounds() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const seTap = new Audio.Sound();
        const seCorrect = new Audio.Sound();
        const seWrong = new Audio.Sound();
        const bgmMain = new Audio.Sound();
        const bgmQuiz = new Audio.Sound();

        await seTap.loadAsync(require('../../assets/sounds/maou_se_system40.mp3'));
        await seCorrect.loadAsync(require('../../assets/sounds/maou_se_onepoint15.mp3'));
        await seWrong.loadAsync(require('../../assets/sounds/maou_se_onepoint33.mp3'));
        await bgmMain.loadAsync(require('../../assets/sounds/maou_bgm_healing15.mp3'));
        await bgmQuiz.loadAsync(require('../../assets/sounds/maou_bgm_healing09.mp3'));
        
        await bgmMain.setIsLoopingAsync(true);
        await bgmQuiz.setIsLoopingAsync(true);

        const newSounds = {
          tap: seTap,
          correct: seCorrect,
          wrong: seWrong,
          bgmMain: bgmMain,
          bgmQuiz: bgmQuiz,
        };
        soundObjectsRef.current = newSounds;
        setSoundObjects(newSounds);

      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    }
    loadSounds();

    return () => {
      Object.values(soundObjectsRef.current).forEach(async (sound: any) => {
        try { await sound.unloadAsync(); } catch (e) {}
      });
    };
  }, []);

  useEffect(() => {
    const manageBgm = async () => {
      if (!soundObjects.bgmMain || !soundObjects.bgmQuiz) return;

      if (!isBgmEnabled) {
        if (currentBgmKey) {
          await soundObjects[currentBgmKey].stopAsync();
          setCurrentBgmKey(null);
        }
        return;
      }

      const isQuizMode = screen === 'quiz-session';
      const targetBgmKey = isQuizMode ? 'bgmQuiz' : 'bgmMain';

      if (currentBgmKey !== targetBgmKey) {
        if (currentBgmKey) {
          await soundObjects[currentBgmKey].stopAsync();
        }
        await soundObjects[targetBgmKey].playAsync();
        setCurrentBgmKey(targetBgmKey);
      } else {
        const status = await soundObjects[targetBgmKey].getStatusAsync();
        if (!status.isPlaying) {
          await soundObjects[targetBgmKey].playAsync();
        }
      }
    };
    manageBgm();
  }, [screen, soundObjects, isBgmEnabled]);

  const playTap = async () => {
    if (!isSeEnabled) return;
    try { await soundObjects.tap?.replayAsync(); } catch (e) {}
  };
  const playCorrect = async () => {
    if (!isSeEnabled) return;
    try { await soundObjects.correct?.replayAsync(); } catch (e) {}
  };
  const playWrong = async () => {
    if (!isSeEnabled) return;
    try { await soundObjects.wrong?.replayAsync(); } catch (e) {}
  };

  useEffect(() => {
    async function prepare() {
      try {
        const name = await AsyncStorage.getItem('user_name');
        const date = await AsyncStorage.getItem('exam_date');
        const b = await AsyncStorage.getItem('bookmarks');
        const w = await AsyncStorage.getItem('wrongs');
        if (name) setUserName(name);
        if (date) setExamDate(date);
        if (b) setBookmarkedIds(new Set(JSON.parse(b)));
        if (w) setWrongIds(new Set(JSON.parse(w)));
        if (!name) setScreen('onboarding');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) { console.warn(e); } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const saveUserInfo = async (data: any) => {
    setUserName(data.name); 
    setExamDate(data.date);
    
    await AsyncStorage.setItem('user_name', data.name);
    await AsyncStorage.setItem('exam_date', data.date);
    // マーケティング項目は任意なので、入力されたもののみ保存する
    if (data.age) await AsyncStorage.setItem('user_age', String(data.age));
    if (data.gender) await AsyncStorage.setItem('user_gender', String(data.gender));
    if (data.occupation) await AsyncStorage.setItem('user_occupation', String(data.occupation));
    if (data.hasDrone) await AsyncStorage.setItem('user_has_drone', String(data.hasDrone));
    if (data.purpose) await AsyncStorage.setItem('user_purpose', String(data.purpose));
    
    try {
      await addDoc(collection(db, 'users'), {
        name: data.name,
        examDate: data.date,
        // 任意項目は未回答の場合そのまま送る（空文字）
        age: data.age ? Number(data.age) : null,
        gender: data.gender || null,
        occupation: data.occupation || null,
        hasDrone: data.hasDrone || null,
        purpose: data.purpose || null,
        registeredAt: serverTimestamp(),
        platform: Platform.OS,
      });
      console.log("Firebaseへのデータ送信成功！");
    } catch (error) {
      console.error("Firebaseへの送信エラー: ", error);
    }

    playTap();
    setScreen('home');
  };

  const save = async (key: string, data: any) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(Array.isArray(data) ? data : Array.from(data))); } catch (e) { console.error(e); }
  };

  const categories = useMemo(() => ['すべて', ...new Set(ALL_QUESTIONS.map((q: QuizItem) => q.category))], []);

  const startQuiz = (mode: any, config: any = {}) => {
    let filtered: any[] = [];
    setQuizMode(mode); 
    setTimeLeft(0);
    
    if (mode === 'textbook') {
       filtered = config.questions;
    } else if (mode === 'bookmark') { 
      filtered = ALL_QUESTIONS.filter(q => bookmarkedIds.has(q.id)); 
    } else if (mode === 'wrong') { 
      filtered = ALL_QUESTIONS.filter(q => wrongIds.has(q.id)); 
    } else {
      let pool = ALL_QUESTIONS;
      // 無料版では「一等を含める」を無視して強制的に二等のみにする場合は
      // 以下の1行を `pool = pool.filter(q => q.classLevel === '2');` に固定してもOKです
      if (!config.includeClass1) pool = pool.filter(q => q.classLevel === '2');
      if (config.category !== 'すべて') pool = pool.filter(q => q.category === config.category);
      filtered = shuffle(pool).slice(0, config.count);
    }

    if (filtered.length === 0) { Alert.alert("情報", "該当する問題がありません。"); return; }
    setQuizQuestions(filtered); 
    setScreen('quiz-session');
  };

  if (!appIsReady) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {screen === 'onboarding' && <OnboardingScreen onComplete={saveUserInfo} playTap={playTap} />}
      
      {screen === 'home' && (
        <HomeView 
          onNavigate={setScreen} 
          userName={userName} 
          examDate={examDate}
          wrongCount={wrongIds.size}
          bookmarkedCount={bookmarkedIds.size}
          onStartMock={(lv: number) => startQuiz(lv === 1 ? 'mock_1' : 'mock_2')}
          onStartReview={(m: string) => startQuiz(m)}
          playTap={playTap}
        />
      )}

      {screen === 'privacy' && <PrivacyPolicyScreen onBack={() => { playTap(); setScreen('home'); }} />}
      {screen === 'how-to-use' && <HowToUseScreen onBack={() => { playTap(); setScreen('home'); }} />}
      
      {screen === 'textbook-mode' && (
        <TextbookModeScreen 
          questions={ALL_QUESTIONS}
          categories={categories.filter(c => c !== 'すべて')} 
          onBack={() => { playTap(); setScreen('home'); }} 
          onStart={(chunk: QuizItem[]) => { playTap(); startQuiz('textbook', { questions: chunk }); }}
          playTap={playTap}
        />
      )}
      {screen === 'practice-config' && (
        <PracticeConfigScreen 
          categories={categories} 
          onBack={() => { playTap(); setScreen('home'); }} 
          onStart={(count: number, is1: boolean, cat: string) => { playTap(); startQuiz('practice', { count, includeClass1: is1, category: cat }); }} 
          playTap={playTap}
        />
      )}
      {screen === 'quiz-session' && (
        <QuizSessionView 
          questions={quizQuestions} 
          mode={quizMode} 
          timerValue={timeLeft} 
          bookmarkedIds={bookmarkedIds} 
          onBack={() => { playTap(); setScreen('home'); }} 
          onToggleBookmark={(id: number) => { 
            playTap();
            const n = new Set(bookmarkedIds); n.has(id) ? n.delete(id) : n.add(id); setBookmarkedIds(n); save('bookmarks', n); 
          }} 
          onWrong={(id: number) => { const n = new Set(wrongIds).add(id); setWrongIds(n); save('wrongs', n); }} 
          onRemoveWrong={(id: number) => {
            const n = new Set(wrongIds);
            n.delete(id);
            setWrongIds(n);
            save('wrongs', n);
          }}
          playTap={playTap}
          playCorrect={playCorrect}
          playWrong={playWrong}
        />
      )}
      {screen === 'problem-list' && (
        <ProblemListScreen 
          questions={ALL_QUESTIONS} 
          categories={categories} 
          onBack={() => { playTap(); setScreen('home'); }} 
          bookmarkedIds={bookmarkedIds} 
          onToggleBookmark={(id: number) => { 
            playTap();
            const n = new Set(bookmarkedIds); n.has(id) ? n.delete(id) : n.add(id); setBookmarkedIds(n); save('bookmarks', n); 
          }} 
          playTap={playTap}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  container: { flex: 1, backgroundColor: '#FFF' },
  padding: { padding: 20 },
  hero: { padding: 24, backgroundColor: '#FFF', paddingTop: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  logoContainer: { width: 140, height: 70, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { width: 100, height: 60, backgroundColor: '#0F172A', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoPlaceholderText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  heroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  messageCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  messageUserText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  countdownText: { fontSize: 15, color: '#64748B', fontWeight: '600' },
  daysValue: { fontSize: 38, fontWeight: '900', color: '#EF4444' },
  encouragementText: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
  footerInfo: { marginTop: 20, alignItems: 'center' },
  privacyLink: { color: '#94A3B8', fontSize: 13, textDecorationLine: 'underline', marginBottom: 12 },
  footerText: { fontSize: 12, color: '#CBD5E1', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16 },
  statLabel: { fontSize: 12, color: '#4F46E5', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 12, marginBottom: 12 },
  mainActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
  actionIconContainer: { width: 56, height: 56, backgroundColor: '#EEF2FF', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  actionSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  mockContainer: { flexDirection: 'row', gap: 12 },
  mockCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#4F46E5', borderWidth: 1, borderColor: '#E2E8F0' },
  mockTitle: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5' },
  mockSub: { fontSize: 12, color: '#64748B', marginTop: 4 },
  grid: { flexDirection: 'row', gap: 12 },
  toolCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  toolLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },

  // --- プロ版誘導ボタン・モーダル用スタイル ---
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAB308', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, marginBottom: 8 },
  premiumBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  premiumCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  closeButton: { position: 'absolute', top: 16, right: 16, padding: 8 },
  premiumIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  premiumTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', textAlign: 'center', lineHeight: 28, marginBottom: 20 },
  premiumFeatures: { width: '100%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, gap: 12, marginBottom: 24 },
  premiumFeatureItem: { fontSize: 14, color: '#334155', lineHeight: 20 },
  premiumPrice: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5', marginBottom: 20 },
  storeButton: { width: '100%', flexDirection: 'row', backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  storeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  premiumSubText: { fontSize: 12, color: '#94A3B8', marginTop: 12 },
});
