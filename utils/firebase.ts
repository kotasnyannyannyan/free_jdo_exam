import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5fVRUiBvZ0SgVnC9tOCvPdy3kTlDQQfc",
  authDomain: "jdoexamtraining.firebaseapp.com",
  projectId: "jdoexamtraining",
  storageBucket: "jdoexamtraining.firebasestorage.app",
  messagingSenderId: "999165359629",
  appId: "1:999165359629:web:3415725ac19b2344054744",
  measurementId: "G-3VKS0KXWRR"
};

// Expoの開発中（保存するたび）に複数回初期化されてエラーになるのを防ぐ安全な書き方
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ここでデータベース（Firestore）を初期化して「db」という名前をつけています
const db = getFirestore(app);

// 作成した「db」を他のファイル（index.tsxなど）で使えるように出力
export { db };