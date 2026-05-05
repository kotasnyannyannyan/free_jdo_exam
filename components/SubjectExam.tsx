import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  Clock,
  Trash2,
  X,
  Lock // 追加: プロ版誘導用の鍵アイコン
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet, Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Linking // 追加: ストアへ飛ばす用
} from 'react-native';

import { QuizItem } from '../constants/questions';
import { Header } from './Common';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { INTERSTITIAL_AD_UNIT_ID, PRO_VERSION_STORE_URL } from '../constants/config';

const { width } = Dimensions.get('window');

// --- 教科書モード選択画面 ---
export const TextbookModeScreen = ({ questions, categories, onBack, onStart, playTap, onRequirePremium }: any) => {
  return (
    <View style={styles.fullScreen}>
      <Header title="教科書モード" onBack={onBack} />
      <ScrollView style={styles.padding} contentContainerStyle={{paddingBottom: 40}}>
        {categories.map((cat: string) => {
          const catQuestions = questions.filter((q: QuizItem) => q.category === cat);
          if (catQuestions.length === 0) return null;

          const chunks = [];
          for (let i = 0; i < catQuestions.length; i += 10) {
            chunks.push(catQuestions.slice(i, i + 10));
          }

          // ▼▼▼ 追加: プロ版限定のダミーボタンを生成するロジック ▼▼▼
          // 無料版は問題数を半分にしているため、本来の問題数は「×2」と仮定して必要なPart数を計算します。
          const totalChunksExpected = Math.ceil((catQuestions.length * 2) / 10);
          const premiumChunksCount = totalChunksExpected - chunks.length;
          
          const premiumButtons = [];
          for (let j = 0; j < premiumChunksCount; j++) {
            const partIndex = chunks.length + j;
            const startNum = partIndex * 10 + 1;
            const endNum = (partIndex + 1) * 10;
            
            premiumButtons.push(
              <TouchableOpacity 
                key={`premium-${cat}-${j}`} 
                style={[styles.chunkButton, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]} 
                onPress={() => {
                  playTap?.();
                  if (onRequirePremium) {
                    onRequirePremium(); // App.tsxなどにアップセル関数があればそれを呼ぶ
                  } else {
                    // デフォルトのアップセルアラート
                    Alert.alert(
                      "プロ版限定機能",
                      "このパートはプロ版にアップグレードすると解放されます！\nプロ版では全400問以上の問題と、本番形式の模擬試験が利用可能です。",
                      [
                        { text: "キャンセル", style: "cancel" },
                        { text: "プロ版をチェック", onPress: () => Linking.openURL(PRO_VERSION_STORE_URL) }
                      ]
                    );
                  }
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.chunkButtonTitle, { color: '#64748B' }]}>Part {partIndex + 1}</Text>
                  <Lock size={14} color="#94A3B8" />
                </View>
                <Text style={[styles.chunkButtonSub, { color: '#94A3B8' }]}>{startNum}〜{endNum}問</Text>
              </TouchableOpacity>
            );
          }
          // ▲▲▲ 追加ロジックここまで ▲▲▲

          return (
            <View key={cat} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{cat}</Text>
              <View style={styles.chunkGrid}>
                
                {/* 既存: 無料版で遊べるボタン */}
                {chunks.map((chunk, idx) => {
                  const startNum = idx * 10 + 1;
                  const endNum = idx * 10 + chunk.length;
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.chunkButton} 
                      onPress={() => {
                        playTap?.();
                        onStart(chunk);
                      }}
                    >
                      <Text style={styles.chunkButtonTitle}>Part {idx + 1}</Text>
                      <Text style={styles.chunkButtonSub}>{startNum}〜{endNum}問</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* 追記: 計算したプロ版限定ダミーボタンを表示 */}
                {premiumButtons}

              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// --- 練習設定画面 ---
export const PracticeConfigScreen = ({ categories, onBack, onStart, playTap }: any) => {
  const [count, setCount] = useState(10);
  const [isClass1, setIsClass1] = useState(false);
  const [selectedCat, setSelectedCat] = useState('すべて');

  return (
    <View style={styles.fullScreen}>
      <Header title="練習の設定" onBack={onBack} />
      <ScrollView style={styles.padding}>
        <Text style={styles.configLabel}>問題数を選択</Text>
        <View style={styles.chipRow}>
          {[10, 20, 30, 50].map(n => (
            <TouchableOpacity 
              key={n} 
              style={[styles.chip, count === n && styles.chipActive]} 
              onPress={() => { playTap?.(); setCount(n); }}
            >
              <Text style={[styles.chipText, count === n && styles.chipTextActive]}>{n}問</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.configLabel}>対象カテゴリ</Text>
        <View style={styles.chipRow}>
          {categories.map((cat: string) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.chip, selectedCat === cat && styles.chipActive]} 
              onPress={() => { playTap?.(); setSelectedCat(cat); }}
            >
              <Text style={[styles.chipText, selectedCat === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.toggleRow, isClass1 && { backgroundColor: '#FAF5FF' }]} 
          onPress={() => { 
            playTap?.(); 
            // ▼ ここをプロ版ロックにする場合は Alert を出します
            Alert.alert(
              "プロ版限定機能",
              "「一等の問題」を含める機能は、プロ版限定となります！",
              [
                { text: "キャンセル", style: "cancel" },
                { text: "プロ版をチェック", onPress: () => Linking.openURL(PRO_VERSION_STORE_URL) }
              ]
            );
          }}
        >
          <Text style={styles.toggleLabel}>一等の問題を含める</Text>
          <View style={[styles.toggleSwitch, isClass1 && { backgroundColor: '#9333EA' }]} />
          
          {/* プロ版バッジ */}
          <View style={{ position: 'absolute', top: -10, right: 10, backgroundColor: '#EAB308', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Lock size={10} color="#FFF" />
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#FFF' }}>プロ版</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startButton} onPress={() => onStart(count, false, selectedCat)}>
          <Text style={styles.startButtonText}>学習を開始する</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// --- 問題一覧画面 ---
export const ProblemListScreen = ({ questions, categories, onBack, bookmarkedIds, onToggleBookmark, playTap }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'すべて') return questions;
    return questions.filter((q: QuizItem) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const renderItem = ({ item }: { item: QuizItem }) => {
    const isBookmarked = bookmarkedIds.has(item.id);
    return (
      <View style={styles.problemItemCard}>
        <View style={styles.problemItemHeader}>
          <Text style={styles.problemId}>問{item.id} <Text style={{color: '#94A3B8'}}>[{item.category}]</Text></Text>
          <TouchableOpacity onPress={() => onToggleBookmark(item.id)}>
            <Bookmark size={20} color={isBookmarked ? "#F59E0B" : "#CBD5E1"} fill={isBookmarked ? "#F59E0B" : "none"} />
          </TouchableOpacity>
        </View>
        <Text style={styles.problemText}>{item.question}</Text>
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>正解:</Text>
          <Text style={styles.answerText}>{item.options[item.answer]}</Text>
        </View>
        <Text style={styles.explanationText}>{item.explanation}</Text>
      </View>
    );
  };

  return (
    <View style={styles.fullScreen}>
      <Header title="問題一覧・復習" onBack={onBack} />
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {categories.map((cat: string) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, selectedCategory === cat && styles.filterChipSelected]}
              onPress={() => { playTap?.(); setSelectedCategory(cat); }}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList 
        data={filteredQuestions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// --- クイズ実施画面 ---
export const QuizSessionView = ({ 
  questions, mode, timerValue, bookmarkedIds, 
  onBack, onToggleBookmark, onWrong, onRemoveWrong,
  playTap, playCorrect, playWrong 
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerValue);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // ▼ error を追加で取得（ロード失敗時の判定用）
  const { isLoaded, isClosed, load, show, error } = useInterstitialAd(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  // ▼ 安全装置：3秒経ったら強制的にボタンを押せるようにする
  const [isAdTimeout, setIsAdTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsAdTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 画面が開いたらすぐに広告を裏で読み込み始める
  useEffect(() => {
    load();
  }, [load]);

  // 広告が閉じられたら、クイズを開始させる＆次回の広告を読み込む
  useEffect(() => {
    if (isClosed) {
      setIsQuizStarted(true);
      load();
    }
  }, [isClosed, load]);

  const handleStartButtonPress = () => {
    try {
      if (isLoaded) {
        show(); // 広告表示 -> 閉じたらuseEffectでisQuizStarted(true)へ
      } else {
        setIsQuizStarted(true); // 広告なしで開始（エラーやタイムアウト時）
      }
    } catch (e) {
      setIsQuizStarted(true);
    }
  };

  const sendLearningData = async () => {
    try {
      const userName = await AsyncStorage.getItem('user_name') || '名無し';
      const wrongItems = history.filter(h => !h.isCorrect);
      
      const wrongCategories = wrongItems.map(h => 
        mode === 'mock_1' || mode === 'mock_2' ? h.question.section : h.question.category
      );
      const wrongQuestionIds = wrongItems.map(h => h.question.id);

      await addDoc(collection(db, 'learning_logs'), {
        userName: userName,
        mode: mode, 
        score: score,
        totalQuestions: questions.length,
        accuracyRate: Math.round((score / questions.length) * 100), 
        wrongCategories: wrongCategories,
        wrongQuestionIds: wrongQuestionIds,
        createdAt: serverTimestamp(),
      });
      console.log("詳細な学習データの送信に成功しました！");
    } catch (err) {
      console.error("学習データの送信エラー: ", err);
    }
  };

  const isMockMode = mode === 'mock_1' || mode === 'mock_2';
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isQuizStarted && timerValue > 0 && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft((prev: number) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isQuizStarted && timerValue > 0 && timeLeft === 0) {
      finishQuiz();
    }
  }, [isQuizStarted, timeLeft, isFinished]);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAns(idx);
    setIsAnswered(true);
    
    const isCorrect = idx === currentQuestion.answer;
    
    if (!isMockMode) {
      if (isCorrect) {
        setScore(score + 1);
        playCorrect?.(); 
      } else {
        onWrong(currentQuestion.id);
        playWrong?.();
      }
    } else {
      if (isCorrect) {
        setScore(score + 1);
      } else {
        onWrong(currentQuestion.id);
      }
      playTap?.();
    }

    setHistory([...history, {
      question: currentQuestion,
      isCorrect: isCorrect,
      userAnswer: idx
    }]);
  };

  const nextQuestion = () => {
    playTap?.();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAns(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    playTap?.();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevLog = history.find(h => h.question.id === questions[currentIndex - 1].id);
      if (prevLog) {
        setSelectedAns(prevLog.userAnswer);
        setIsAnswered(true);
      } else {
        setSelectedAns(null);
        setIsAnswered(false);
      }
    }
  };

  const finishQuiz = () => {
    if (isLoaded) {
      show();
    }
    sendLearningData();
    setIsFinished(true);
  };

  const handleRemoveWrong = () => {
    Alert.alert(
      "削除の確認",
      "この問題を「要復習」リストから削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除する", 
          style: "destructive", 
          onPress: () => {
            onRemoveWrong(currentQuestion.id);
            playTap?.();
            nextQuestion();
          } 
        }
      ]
    );
  };

  // --- 開始前（準備）画面 ---
  if (!isQuizStarted) {
    const isReady = isLoaded || !!error || isAdTimeout;

    return (
      <View style={styles.fullScreen}>
        <Header title="準備" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Clock size={64} color="#4F46E5" style={{ marginBottom: 24 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 }}>準備完了！</Text>
          <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>
            {isMockMode ? "模擬試験を開始します。\n本番と同じ環境で集中して頑張りましょう！" : "問題の準備ができました。\n自分のペースで進めてください。"}
          </Text>
          
          <TouchableOpacity 
            style={[styles.startButton, { width: '100%', backgroundColor: isReady ? '#0F172A' : '#94A3B8' }]} 
            onPress={() => {
              playTap?.();
              handleStartButtonPress();
            }}
            disabled={!isReady}
          >
            <Text style={styles.startButtonText}>
              {isReady ? "学習を開始する" : "広告を準備中..."}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- 結果画面 ---
  if (isFinished) {
    const percent = Math.round((score / questions.length) * 100);
    
    const ReviewItem = ({ item, index }: any) => {
      const [expanded, setExpanded] = useState(false);
      const isLevel1 = item.question.section === '5-1';
      const displayLevel = isLevel1 ? '一等' : '二等';

      return (
        <View style={styles.reviewCard}>
          <TouchableOpacity 
            style={styles.reviewHeader} 
            onPress={() => {
              playTap?.();
              setExpanded(!expanded);
            }}
          >
            <View style={styles.reviewIcon}>
              {item.isCorrect ? <CheckCircle2 size={24} color="#10B981" /> : <X size={24} color="#EF4444" />}
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.reviewQNum}>
                問{index + 1} {isMockMode && <Text style={{color: isLevel1 ? '#9333EA' : '#0284C7', fontWeight:'bold'}}>[{displayLevel}]</Text>}
              </Text>
              <Text style={styles.reviewQText} numberOfLines={1}>{item.question.question}</Text>
            </View>
            <View>
              {expanded ? <ChevronUp size={20} color="#64748B"/> : <ChevronDown size={20} color="#64748B"/>}
            </View>
          </TouchableOpacity>
          
          {expanded && (
            <View style={styles.reviewDetail}>
              <Text style={[styles.reviewAnsLabel, {color: item.isCorrect ? '#10B981' : '#EF4444'}]}>
                {item.isCorrect ? "正解" : `不正解 (あなたの回答: ${item.question.options[item.userAnswer]})`}
              </Text>
              <Text style={styles.reviewCorrectText}>正解: {item.question.options[item.question.answer]}</Text>
              {item.question.explanation ? (
                <View style={styles.reviewExplBox}>
                  <Text style={styles.reviewExplTitle}>解説</Text>
                  <Text style={styles.reviewExplText}>{item.question.explanation}</Text>
                </View>
              ) : (
                <Text style={{color:'#94A3B8', marginTop:4}}>解説はありません</Text>
              )}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.fullScreen}>
        <Header title="試験結果" onBack={onBack} />
        <ScrollView style={styles.padding} contentContainerStyle={{paddingBottom: 40}}>
          <View style={styles.resultSummary}>
            <Text style={styles.resultScoreLabel}>スコア</Text>
            <Text style={styles.resultScoreVal}>{score} <Text style={{fontSize:20, color:'#64748B'}}>/ {questions.length}</Text></Text>
            <Text style={styles.resultPercent}>{percent}% 正解</Text>
          </View>

          <Text style={styles.sectionTitle}>回答一覧</Text>
          <Text style={styles.subHint}>タップして詳細・解説を確認できます</Text>
          
          <View style={{gap: 12}}>
            {history.map((item, idx) => (
              <ReviewItem key={idx} item={item} index={idx} />
            ))}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={onBack}>
            <Text style={styles.startButtonText}>メニューに戻る</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- クイズ中の表示 ---
  return (
    <View style={styles.fullScreen}>
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={() => { playTap?.(); Alert.alert("中断", "クイズを中断しますか？", [{text: "キャンセル"}, {text: "中断", onPress: onBack}]); }}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      <ScrollView style={styles.padding}>
        {timerValue > 0 && (
          <View style={styles.timerBox}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.timerText}>{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</Text>
          </View>
        )}

        <View style={styles.qHeader}>
          {isMockMode ? (
            <Text style={[styles.qCategory, currentQuestion.section === '5-1' ? {color: '#9333EA', backgroundColor: '#FAF5FF'} : {color: '#0284C7', backgroundColor: '#E0F2FE'}]}>
              {currentQuestion.section === '5-1' ? '一等' : '二等'}
            </Text>
          ) : (
            <Text style={styles.qCategory}>{currentQuestion.category}</Text>
          )}

          <View style={{flexDirection:'row', gap:10}}>
            {mode === 'wrong' && (
              <TouchableOpacity onPress={handleRemoveWrong}>
                <Trash2 size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => onToggleBookmark(currentQuestion.id)}>
              <Bookmark size={24} color={bookmarkedIds.has(currentQuestion.id) ? "#F59E0B" : "#CBD5E1"} fill={bookmarkedIds.has(currentQuestion.id) ? "#F59E0B" : "none"} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.qText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt: string, idx: number) => {
            const isRightChoice = idx === currentQuestion.answer;
            const isSelected = idx === selectedAns;
            const showResult = isAnswered && !isMockMode;
            
            let btnStyle = styles.optionButton;
            let textStyle = styles.optionText;
            let icon = null;

            if (showResult) {
              if (isRightChoice) {
                btnStyle = {...btnStyle, ...styles.optionCorrect};
                textStyle = {...textStyle, color: '#FFF'};
                icon = <Circle size={20} color="#FFF" style={{marginRight:8}} strokeWidth={3} />;
              } else if (isSelected && !isRightChoice) {
                btnStyle = {...btnStyle, ...styles.optionWrong};
                textStyle = {...textStyle, color: '#FFF'};
                icon = <X size={20} color="#FFF" style={{marginRight:8}} strokeWidth={3} />;
              }
            } else if (isAnswered && isMockMode && isSelected) {
              btnStyle = {...btnStyle, borderColor: '#4F46E5', backgroundColor: '#EEF2FF'};
              textStyle = {...textStyle, color: '#4F46E5', fontWeight: 'bold'};
            }

            return (
              <TouchableOpacity 
                key={idx} 
                style={btnStyle} 
                onPress={() => handleAnswer(idx)} 
                disabled={isAnswered}
              >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  {icon}
                  <Text style={[textStyle, {flex: 1}]}>{opt}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && !isMockMode && (
          <View style={styles.explanationBox}>
            <View style={styles.exHeader}>
              <AlertCircle size={18} color="#4F46E5" />
              <Text style={styles.exTitle}>解説</Text>
            </View>
            <Text style={styles.exText}>{currentQuestion.explanation || "解説準備中"}</Text>
          </View>
        )}

        <View style={styles.navButtonRow}>
          {currentIndex > 0 && (
            <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={prevQuestion}>
              <Text style={[styles.navButtonText, {color: '#64748B'}]}>前の問題</Text>
            </TouchableOpacity>
          )}
          
          {isAnswered && (
            <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={nextQuestion}>
              <Text style={[styles.navButtonText, {color: '#FFF'}]}>
                {currentIndex === questions.length - 1 ? "結果を見る" : "次の問題へ"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#FFF' },
  padding: { padding: 20 },
  categorySection: { marginBottom: 24 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#059669', paddingLeft: 10 },
  chunkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chunkButton: { width: '48%', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#059669' },
  chunkButtonTitle: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
  chunkButtonSub: { fontSize: 12, color: '#047857' },
  configLabel: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginTop: 20, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, marginTop: 24 },
  toggleLabel: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  toggleSwitch: { width: 44, height: 24, backgroundColor: '#CBD5E1', borderRadius: 12 },
  startButton: { backgroundColor: '#0F172A', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  startButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  filterBar: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  filterChipSelected: { backgroundColor: '#0F172A' },
  filterChipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  filterChipTextSelected: { color: '#FFF' },
  listContent: { padding: 20 },
  problemItemCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  problemItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  problemId: { fontSize: 12, fontWeight: 'bold', color: '#4F46E5' },
  problemText: { fontSize: 15, color: '#1E293B', lineHeight: 22, fontWeight: '500' },
  answerBox: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginVertical: 12 },
  answerLabel: { fontSize: 11, fontWeight: 'bold', color: '#166534', marginBottom: 2 },
  answerText: { fontSize: 14, color: '#166534', fontWeight: 'bold' },
  explanationText: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  quizHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  progressContainer: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#4F46E5' },
  progressText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 20 },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  qCategory: { fontSize: 12, fontWeight: 'bold', color: '#4F46E5', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', lineHeight: 30, marginBottom: 24 },
  optionsContainer: { gap: 12 },
  optionButton: { padding: 20, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9' } as ViewStyle,
  optionText: { fontSize: 16, fontWeight: '600', color: '#334155' } as TextStyle,
  optionCorrect: { backgroundColor: '#10B981', borderColor: '#10B981' } as ViewStyle,
  optionWrong: { backgroundColor: '#EF4444', borderColor: '#EF4444' } as ViewStyle,
  explanationBox: { marginTop: 24, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20, borderTopWidth: 4, borderTopColor: '#4F46E5' },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  exTitle: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  exText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  navButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 10 },
  navButton: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextButton: { backgroundColor: '#4F46E5' },
  prevButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  navButtonText: { fontWeight: 'bold', fontSize: 15 },
  resultSummary: { alignItems: 'center', marginBottom: 32, padding: 24, backgroundColor: '#F8FAFC', borderRadius: 20 },
  resultScoreLabel: { fontSize: 14, color: '#64748B', fontWeight: 'bold' },
  resultScoreVal: { fontSize: 48, fontWeight: '900', color: '#4F46E5', marginVertical: 8 },
  resultPercent: { fontSize: 18, color: '#64748B', fontWeight: 'bold' },
  resultMsg: { textAlign: 'center', color: '#475569', lineHeight: 24, marginBottom: 40 },
  subHint: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  reviewIcon: { width: 32, alignItems: 'center' },
  reviewQNum: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 2 },
  reviewQText: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  reviewDetail: { padding: 16, paddingTop: 0, backgroundColor: '#FAF5FF' },
  reviewAnsLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  reviewCorrectText: { fontSize: 14, color: '#1E293B', marginBottom: 12 },
  reviewExplBox: { backgroundColor: '#FFF', padding: 12, borderRadius: 8 },
  reviewExplTitle: { fontSize: 12, fontWeight: 'bold', color: '#9333EA', marginBottom: 4 },
  reviewExplText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 24, marginBottom: 12 },
});
