import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}><ChevronLeft size={24} color="#334155" /></TouchableOpacity>
    <Text style={styles.headerTitleText}>{title}</Text>
    <View style={{width: 24}} />
  </View>
);

export const MenuCard = ({ title, sub, icon, onPress, color }: any) => (
  <TouchableOpacity style={[styles.menuCard, {backgroundColor: color}]} onPress={onPress}>
    <View style={styles.menuIcon}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.menuTitleText}>{title}</Text>
      <Text style={styles.menuSubText}>{sub}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  menuIcon: { marginRight: 16 },
  menuTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  menuSubText: { fontSize: 12, color: '#64748B' },
});